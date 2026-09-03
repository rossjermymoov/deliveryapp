import 'package:flutter/material.dart';
import 'package:signature/signature.dart';
import '../models/models.dart';

class PodCaptureScreen extends StatefulWidget {
  final ShipmentStop stop;

  const PodCaptureScreen({Key? key, required this.stop}) : super(key: key);

  @override
  State<PodCaptureScreen> createState() => _PodCaptureScreenState();
}

class _PodCaptureScreenState extends State<PodCaptureScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  final SignatureController _signatureController = SignatureController(
    penStrokeWidth: 3,
    penColor: const Color(0xFF003366),
    exportBackgroundColor: Colors.white,
  );

  @override
  void initState() {
    super.initState();
    _nameController.text = widget.stop.customerName;
  }

  @override
  void dispose() {
    _signatureController.dispose();
    _nameController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _submitPod() {
    // In production, upload base64 signature, photo & geo coordinates to API
    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      appBar: AppBar(
        backgroundColor: const Color(0xFF003366),
        title: const Text('Proof of Delivery (POD)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.stop.customerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('${widget.stop.address}, ${widget.stop.postcode}', style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 6),
                    Text('📦 ${widget.stop.itemsDescription}', style: const TextStyle(color: Colors.amber, fontSize: 12)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Customer / Signee Name', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 6),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Draw Signature on Screen', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                TextButton(
                  onPressed: () => _signatureController.clear(),
                  child: const Text('Clear', style: TextStyle(color: Colors.red)),
                ),
              ],
            ),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Signature(
                  controller: _signatureController,
                  height: 140,
                  backgroundColor: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Delivery Photo (Plastics Placed On Site)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 6),
            Container(
              width: double.infinity,
              height: 100,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
              ),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.camera_alt, color: Colors.grey, size: 30),
                    Text('Tap to snap photo of delivered goods', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _submitPod,
                icon: const Icon(Icons.check_circle),
                label: const Text('Confirm POD & Complete Stop', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
