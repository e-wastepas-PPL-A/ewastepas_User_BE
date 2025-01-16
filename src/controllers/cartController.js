const CartModel = require('../models/cartModel');

exports.addItem = async (req, res) => {
  const { waste_id, quantity } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
  }

  const community_id = req.user.id;

  try {
    // Periksa apakah cart sudah ada untuk user
    let cart = await CartModel.getCartByCommunityId(community_id);

    if (!cart) {
      // Jika cart belum ada, buat cart baru untuk user
      cart = await CartModel.createCart(community_id);
    }

    const cart_id = cart.cart_id;

    // Tambahkan item ke tabel cart_detail
    const item = await CartModel.addOrUpdateCartItem(cart_id, waste_id, quantity);
    res.status(201).json({
      message: 'Item berhasil ditambahkan ke keranjang.',
      item,
    });
  } catch (error) {
    console.error('Error in addItem:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.decreaseItem = async (req, res) => {
  const { waste_id, quantity } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
  }

  const community_id = req.user.id;

  try {
    // Cari cart berdasarkan community_id
    const cart = await CartModel.getCartByCommunityId(community_id);

    if (!cart) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan. Silakan tambahkan item terlebih dahulu.' });
    }

    const cart_id = cart.cart_id;

    // Kurangi jumlah item di cart_detail
    const updatedItem = await CartModel.decreaseCartItem(cart_id, waste_id, quantity);

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item tidak ditemukan di keranjang.' });
    }

    res.status(200).json({
      message: 'Item berhasil diperbarui di keranjang.',
      item: updatedItem,
    });
  } catch (error) {
    console.error('Error in decreaseItem:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.viewCart = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
  }

  const community_id = req.user.id;

  try {
    // Cari cart berdasarkan community_id
    const cart = await CartModel.getCartByCommunityId(community_id);

    if (!cart) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan.' });
    }

    const cart_id = cart.cart_id;

    // Ambil semua item dari tabel cart_detail dengan informasi tambahan dari tabel waste
    const items = await CartModel.getAllCartItems(cart_id);

    res.status(200).json({
      message: 'Isi keranjang berhasil diambil.',
      items,
    });
  } catch (error) {
    console.error('Error in viewCart:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};


exports.deleteItem = async (req, res) => {
  const { waste_id } = req.body;

  // Verifikasi pengguna login
  if (!req.user) {
    return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
  }

  const community_id = req.user.id;

  try {
    // Cari cart berdasarkan community_id
    const cart = await CartModel.getCartByCommunityId(community_id);

    if (!cart) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan.' });
    }

    const cart_id = cart.cart_id;

    // Hapus item dari tabel cart_detail berdasarkan cart_id dan waste_id
    const isDeleted = await CartModel.deleteCartItem(cart_id, waste_id);

    if (!isDeleted) {
      return res.status(404).json({ message: 'Item tidak ditemukan di keranjang.' });
    }

    res.status(200).json({
      message: 'Item berhasil dihapus dari keranjang.',
    });
  } catch (error) {
    console.error('Error in deleteItem:', error);
    res.status(500).json({ message: error.message });
  }
};
