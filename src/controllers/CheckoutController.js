const CartModel = require('../models/cartModel');
const CheckoutModel = require('../models/CheckoutModel'); // Ubah nama model di sini

exports.checkout = async (req, res) => {
  const { pickup_date, pickup_time, selectedItems } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
  }

  const community_id = req.user.id;

  try {
    // Step 1: Ambil alamat dari tabel community
    const address = await CartModel.getAddressByCommunityId(community_id);
    if (!address) {
      return res.status(404).json({ message: 'Alamat pengguna tidak ditemukan.' });
    }

    // Step 2: Validasi selectedItems
    if (!selectedItems || selectedItems.length === 0) {
      return res.status(400).json({ message: 'Tidak ada item yang dipilih untuk checkout.' });
    }

    // Step 3: Ambil detail item yang dipilih dari tabel cart_detail
    const cartDetails = await CartModel.getCartDetailsByCommunityId(community_id);
    const itemsToCheckout = cartDetails.filter((item) =>
      selectedItems.includes(item.waste_id)
    );

    if (itemsToCheckout.length === 0) {
      return res.status(400).json({ message: 'Item yang dipilih tidak valid.' });
    }

    // Step 4: Simpan data ke tabel pickup_waste
    const pickup_id = await CheckoutModel.createPickupWaste(
      community_id,
      address,
      pickup_date,
      pickup_time
    );
    if (!pickup_date || !pickup_time || !Array.isArray(selectedItems)) {
      return res.status(400).json({ message: "Data tidak lengkap atau salah format." });
    }
    

    // Step 5: Simpan detail item ke tabel pickup_detail
    await CheckoutModel.createPickupDetails(pickup_id, itemsToCheckout);

    // Step 6: Hapus item dari tabel cart_detail
    for (const item of itemsToCheckout) {
      await CartModel.deleteCartItem(item.cart_id, item.waste_id);
    }

    res.status(201).json({
      message: 'Checkout berhasil.',
      pickup: {
        pickup_id,
        address,
        pickup_date,
        pickup_time,
        items: itemsToCheckout,
      },
    });
  } catch (error) {
    console.error('Error in checkout:', error);
    res.status(500).json({ message: error.message });
  }
};
exports.getAddress = async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
    }
  
    const community_id = req.user.id;
  
    try {
      const address = await CheckoutModel.getAddressByCommunityId(community_id);
      if (!address) {
        return res.status(404).json({ message: 'Alamat tidak ditemukan.' });
      }
      res.status(200).json({ address });
    } catch (error) {
      console.error('Error in getAddress:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.previewCheckout = async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "User belum login. Silakan login terlebih dahulu." });
    }
  
    const community_id = req.user.id;
    const { selectedItems } = req.body; // Ambil selectedItems dari request body
  
    try {
      // Validasi jika selectedItems kosong
      if (!selectedItems || selectedItems.length === 0) {
        return res.status(400).json({ message: "Tidak ada item yang dipilih untuk preview." });
      }
  
      // Ambil detail item berdasarkan selectedItems
      const cartDetails = await CheckoutModel.getCartDetailsForCheckout(community_id);
  
      // Filter barang berdasarkan selectedItems
      const itemsToPreview = cartDetails.filter((item) =>
        selectedItems.includes(item.waste_id)
      );
  
      if (itemsToPreview.length === 0) {
        return res.status(404).json({ message: "Tidak ada item yang cocok untuk preview." });
      }
  
      res.status(200).json({ items: itemsToPreview });
    } catch (error) {
      console.error("Error in previewCheckout:", error);
      res.status(500).json({ message: error.message });
    }
  };
