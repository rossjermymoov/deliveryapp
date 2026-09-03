import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/models.dart';
import 'pod_capture_screen.dart';

class ManifestScreen extends StatefulWidget {
  final Driver driver;
  final DeliveryManifest manifest;

  const ManifestScreen({
    Key? key,
    required this.driver,
    required this.manifest,
  }) : super(key: key);

  @override
  State<ManifestScreen> createState() => _ManifestScreenState();
}

class _ManifestScreenState extends State<ManifestScreen> {
  // Launch Google Maps driving directions
  Future<void> _launchGoogleMaps(ShipmentStop stop) async {
    final query = Uri.encodeComponent('${stop.address}, ${stop.postcode}');
    final url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$query&travelmode=driving');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  Color _getChannelColor(String channel) {
    switch (channel) {
      case 'B&Q':
        return const Color(0xFFFF5A00);
      case 'Shopify':
        return const Color(0xFF96BF48);
      case 'eBay':
        return const Color(0xFFE53238);
      default:
        return Colors.blueGrey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final completedCount = widget.manifest.stops.where((s) => s.status == 'DELIVERED').length;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        backgroundColor: const Color(0xFF003366),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.driver.name,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              '${widget.driver.depotName} • ${widget.driver.vehicleReg}',
              style: const TextStyle(fontSize: 12, color: Colors.blueAccent),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Route Header Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFF002244),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('MANIFEST', style: TextStyle(color: Colors.white54, fontSize: 10)),
                    Text(
                      widget.manifest.routeNumber,
                      style: const TextStyle(color: Color(0xFFFFB800), fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Text(
                  '$completedCount / ${widget.manifest.totalStops} Completed',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
          ),

          // Stops List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: widget.manifest.stops.length,
              itemBuilder: (context, index) {
                final stop = widget.manifest.stops[index];
                final isDelivered = stop.status == 'DELIVERED';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(
                      color: isDelivered ? Colors.green.shade200 : Colors.grey.shade300,
                      width: isDelivered ? 1.5 : 1,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 14,
                                  backgroundColor: isDelivered ? Colors.green : const Color(0xFF003366),
                                  child: Text(
                                    '${stop.stopSequence}',
                                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: _getChannelColor(stop.channel).withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(6),
                                    border: BorderSide(color: _getChannelColor(stop.channel).withOpacity(0.4)),
                                  ),
                                  child: Text(
                                    '${stop.channel} Order',
                                    style: TextStyle(
                                      color: _getChannelColor(stop.channel),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              stop.trackingNumber,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          stop.customerName,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 16, color: Colors.redAccent),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                '${stop.address}, ${stop.postcode}',
                                style: const TextStyle(color: Colors.black87, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: BorderSide(color: Colors.amber.shade200),
                          ),
                          child: Text(
                            '📦 ${stop.itemsDescription}',
                            style: TextStyle(color: Colors.brown.shade800, fontSize: 12),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Action Buttons
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _launchGoogleMaps(stop),
                                icon: const Icon(Icons.navigation, size: 16, color: Color(0xFF005696)),
                                label: const Text('Google Maps', style: TextStyle(color: Color(0xFF005696))),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: isDelivered ? Colors.green : const Color(0xFF005696),
                                ),
                                onPressed: isDelivered
                                    ? null
                                    : () async {
                                        final res = await Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => PodCaptureScreen(stop: stop),
                                          ),
                                        );
                                        if (res == true) {
                                          setState(() {
                                            stop.status = 'DELIVERED';
                                          });
                                        }
                                      },
                                getContent: () {},
                                icon: Icon(isDelivered ? Icons.check_circle : Icons.camera_alt, size: 16),
                                label: Text(isDelivered ? 'Delivered' : 'Deliver / POD'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
