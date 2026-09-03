import 'package:flutter/material.dart';
import 'models/models.dart';
import 'screens/manifest_screen.dart';

void main() {
  runApp(const KalsiDriverApp());
}

class KalsiDriverApp extends StatelessWidget {
  const KalsiDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Sample Driver & Manifest initialized for Kalsi Birmingham Depot
    final driver = Driver(
      id: 'drv_bhm_1',
      name: 'Dave Jenkins',
      phone: '+44 7700 900101',
      vehicleReg: 'KL24 BHM',
      depotName: 'Birmingham Central Depot',
    );

    final sampleManifest = DeliveryManifest(
      routeId: 'rt_bhm_01',
      routeNumber: 'RT-BHM-8819',
      status: 'IN_PROGRESS',
      totalStops: 4,
      totalDistanceKm: 34.2,
      stops: [
        ShipmentStop(
          id: 'shp_1',
          trackingNumber: 'KAL-BHM-9011',
          externalOrderId: 'BQ-881920',
          channel: 'B&Q',
          customerName: 'Marcus Evans (Trade Builder)',
          customerPhone: '+44 7711 223344',
          address: '42 Highfield Road, Edgbaston',
          postcode: 'B15 3DZ',
          lat: 52.4688,
          lng: -1.9325,
          itemsDescription: '4x 5m Anthracite Grey Fascia, 3x Square Gutter 4m',
          specialNotes: 'Heavy 5m lengths. Gate code 1984.',
          dwellTimeMins: 20,
          stopSequence: 1,
          status: 'OUT_FOR_DELIVERY',
        ),
        ShipmentStop(
          id: 'shp_2',
          trackingNumber: 'KAL-BHM-9012',
          externalOrderId: 'SHOP-94101',
          channel: 'Shopify',
          customerName: 'Mrs. Janet Wood',
          customerPhone: '+44 7822 334455',
          address: '15 Sutton Road, Erdington',
          postcode: 'B23 6QJ',
          lat: 52.5273,
          lng: -1.8411,
          itemsDescription: '2x 3m Hollow Soffit White, 1x 110mm Soil Pipe',
          specialNotes: 'Leave on driveway if no answer.',
          dwellTimeMins: 15,
          stopSequence: 2,
          status: 'ROUTED',
        ),
        ShipmentStop(
          id: 'shp_3',
          trackingNumber: 'KAL-BHM-9013',
          channel: 'eBay',
          externalOrderId: 'EBAY-49210',
          customerName: 'Liam Patterson Plastics Ltd',
          customerPhone: '+44 7933 445566',
          address: 'Unit 4, Redfern Industrial Estate, Tyseley',
          postcode: 'B11 2BE',
          lat: 52.4578,
          lng: -1.8415,
          itemsDescription: '10x 5m Black Ash Shiplap Cladding, 4x Starter Trims',
          specialNotes: 'Forklift available on site.',
          dwellTimeMins: 25,
          stopSequence: 3,
          status: 'ROUTED',
        ),
      ],
    );

    return MaterialApp(
      title: 'Kalsi Driver App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF003366)),
        useMaterial3: true,
      ),
      home: ManifestScreen(driver: driver, manifest: sampleManifest),
    );
  }
}
