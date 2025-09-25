import { Injectable, Logger } from '@nestjs/common';
import { Address } from '../addresses/entities/address.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ShippingChargesService {
  private readonly logger = new Logger(ShippingChargesService.name);
  private readonly originCoords = { lon: 74.45328709622736, lat: 31.53076736498181 }; // Lahore
  private readonly localFee = 150; // Fixed fee for Lahore
  private readonly perKmIncrement = 20; // Fee changes every 20km
  private readonly feePerIncrement = 50; // Fee to add for each increment
  private readonly defaultFee = 1000; // Fallback fee

  constructor(private readonly httpService: HttpService) {}

  async calculateCharges(address: Address): Promise<number> {
    try {
      const distance = await this.getDistanceFromLahore(address);

      if (distance < 0) { // Error case from helper
        return this.defaultFee;
      }

      if (distance === 0) { // Local delivery
        return this.localFee;
      }

      const distanceIncrements = Math.ceil(distance / this.perKmIncrement);
      const distanceFee = distanceIncrements * this.feePerIncrement;

      return this.localFee + distanceFee;
    } catch (error) {
      this.logger.error('Could not calculate distance-based shipping', error);
      return this.defaultFee; // Return default fee if any error occurs
    }
  }

  private async getDistanceFromLahore(address: Address): Promise<number> {
    const fullAddressString = `${address.street}, ${address.city}, ${address.state}, ${address.country}`;

    // 1. Geocode the address to get coordinates
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddressString)}&format=json&limit=1`;

    let destCoords: { lon: string, lat: string };

    try {
      const geocodeResponse = await firstValueFrom(this.httpService.get(geocodeUrl, { headers: { 'User-Agent': 'ECommerceApp/1.0' } }));
      if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
        this.logger.warn(`Could not geocode address: ${fullAddressString}`);
        return -1; // Sentinel value for error
      }
      destCoords = geocodeResponse.data[0];
    } catch (error) {
      this.logger.error(`Geocoding API call failed for address: ${fullAddressString}`, error);
      return -1;
    }

    // 2. Get the driving distance from OSRM
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${this.originCoords.lon},${this.originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`;

    try {
      const distanceResponse = await firstValueFrom(this.httpService.get(osrmUrl));
      if (!distanceResponse.data || distanceResponse.data.routes.length === 0) {
        this.logger.warn(`Could not find a route for address: ${fullAddressString}`);
        return -1;
      }
      // Distance is returned in meters, convert to kilometers
      const distanceInMeters = distanceResponse.data.routes[0].distance;
      return distanceInMeters / 1000;
    } catch (error) {
      this.logger.error(`OSRM API call failed for address: ${fullAddressString}`, error);
      return -1;
    }
  }
}
