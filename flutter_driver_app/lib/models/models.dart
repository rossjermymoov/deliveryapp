enum SalesChannel { bAndQ, shopify, eBay, direct }

class Driver {
  final String id;
  final String name;
  final String phone;
  final String vehicleReg;
  final String depotName;

  Driver({
    required this.id,
    required this.name,
    required this.phone,
    required this.vehicleReg,
    required this.depotName,
  });
}

class ShipmentStop {
  final String id;
  final String trackingNumber;
  final String externalOrderId;
  final String channel; // "B&Q", "Shopify", "eBay"
  final String customerName;
  final String customerPhone;
  final String address;
  final String postcode;
  final double lat;
  final double lng;
  final String itemsDescription;
  final String? specialNotes;
  final int dwellTimeMins;
  final int stopSequence;
  String status; // ROUTED, OUT_FOR_DELIVERY, DELIVERED

  ShipmentStop({
    required this.id,
    required this.trackingNumber,
    required this.externalOrderId,
    required this.channel,
    required this.customerName,
    required this.customerPhone,
    required this.address,
    required this.postcode,
    required this.lat,
    required this.lng,
    required this.itemsDescription,
    this.specialNotes,
    required this.dwellTimeMins,
    required this.stopSequence,
    required this.status,
  });
}

class DeliveryManifest {
  final String routeId;
  final String routeNumber;
  final String status;
  final int totalStops;
  final double totalDistanceKm;
  final List<ShipmentStop> stops;

  DeliveryManifest({
    required this.routeId,
    required this.routeNumber,
    required this.status,
    required this.totalStops,
    required this.totalDistanceKm,
    required this.stops,
  });
}
