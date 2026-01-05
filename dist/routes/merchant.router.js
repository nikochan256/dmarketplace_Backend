var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { addToprintfullCart, createStore, deleteCartItemFromCart, getAllMerchants, getAllStores, getDashboardMetrics, getMerchantById, getMerchantsByStatus, getPendingMerchants, getstoreApiKey, getStoreWalletAddress, updateMerchantVerification, updateOrderStatus, updateQuantityinCart } from "../services/merchant.service.js";
import { upload } from "../config/multer.config.js";
import prisma from "../lib/prisma.js";
const router = express.Router();
// create-store working , need to add all the fields
// new merchant features , printful integration,
// i will get all the products from the printfull 
// i will need to store the user's api-key and store id in the database for now 
// seller schema will change now 
// cart logic will probably remain the same user must see all the products he has in  his cart
// he should also see what all orders he has also purchased,
// 
router.post("/create-store", upload.fields([
    { name: "image", maxCount: 1 },
    { name: "kybDocument", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const files = req.files;
        if (!files || !files.kybDocument || !files.image) {
            return res.status(400).json({ msg: "image and kybDocument are required" });
        }
        // Convert buffers to base64 strings
        const logoBase64 = files.image[0].buffer.toString('base64');
        const kybBase64 = files.kybDocument[0].buffer.toString('base64');
        const payload = {
            shopName: body.shopName,
            walletAddress: body.walletAddress,
            businessEmail: body.businessEmail,
            api_key: body.api_key,
            store_id: Number(body.store_id),
            logoImg: logoBase64,
            kybDocument: kybBase64,
            discription: body.description,
            contact: body.contact,
            address: body.address,
            status: body.status,
        };
        const store = yield createStore(payload);
        console.log("store has been created", store);
        try {
            fetch('https://gifq-sender-smtp-gifq.vercel.app/emails/store-approval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: body.businessEmail
                })
            });
        }
        catch (emailError) {
            console.error('⚠️ Email service error:', emailError);
            // Don't fail the store creation if email fails
        }
        res.status(200).json({
            msg: "wait for admin to review and allow your application",
            data: store,
        });
    }
    catch (err) {
        console.error("❌ Error creating store:", err);
        res.status(500).json({ msg: "store not created", error: err });
    }
}));
// have to add a enum in the category section 
// router.post(
//   "/add-product/:id",
//   upload.fields([{ name: "image", maxCount: 1 }]),
//   async (req: Request, res: Response) => {
//     const sellerId = Number(req.params.id);
//     const body = req.body;
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//     // Validate body fields
//     if (
//       !body.name ||
//       !body.description ||
//       !body.price ||
//       !body.stock ||
//       !body.category
//     ) {
//       return res.status(400).json({ msg: "Invalid payload received" });
//     }
//     // Validate uploaded image
//     if (!files || !files.image || files.image.length === 0) {
//       return res.status(400).json({ msg: "Image is required" });
//     }
//     const imagePath = files.image[0].path;
//     const payload = {
//       name: body.name,
//       description: body.description,
//       price: Number(body.price),
//       stock: Number(body.stock),
//       image: imagePath,
//       category: body.category,
//       sellerId: sellerId,
//     };
//     try {
//       const newProduct = await createProduct(payload);
//       return res.status(201).json({ msg: "Product created", data: newProduct });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ msg: "Server error" });
//     }
//   }
// );
// get all the products listed by merchant 
// router.get("/all-products/:id" , async(req:Request , res:Response)=>{
//   try{
//        const sellerId = Number(req.params.id) ; 
//        const get_merchants_products = await getMerchantProduct(sellerId);
//        const baseUrl = `${req.protocol}://${req.get('host')}`;
//        // Transform products to include full image URLs
//        const productsWithImageUrls = get_merchants_products.map(product => ({
//          ...product,
//          image: product.image ? `${baseUrl}/${product.image.replace(/\\/g, '/')}` : null
//        }));
//        res.status(200).json({
//          msg: "all the products of this merchant",
//          data: productsWithImageUrls
//        });
//   }catch(err){
//     res.status(500).json({msg:err})
//   }
// })
// router.post(
//   "/create-store-simple",
//   async (req: Request, res: Response) => {
//     try {
//       const body: sellerBody = req.body;
//       console.log(body)
//       // Validate required fields
//       if (!body.shopName || !body.walletAddress || !body.businessEmail) {
//         return res.status(400).json({ 
//           msg: "shopName, walletAddress, and businessEmail are required" 
//         });
//       }
//       const payload = {
//         shopName: body.shopName,
//         walletAddress: body.walletAddress,
//         businessEmail: body.businessEmail,
//         api_key: body.api_key,
//         logoImg: "null",
//         kybDocument: "null",
//         store_id: Number(body.store_id),
//         discription: body.description,
//         contact: body.contact,
//         address: body.address,
//         status: body.status || "pending",
//       };
//       const store = await createStore(payload);
//       console.log("store has been created", store);
//       try {
//         fetch('https://gifq-sender-smtp-gifq.vercel.app/emails/store-approval', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             email: body.businessEmail
//           })
//         });
//       } catch (emailError) {
//         console.error('⚠️ Email service error:', emailError);
//         // Don't fail the store creation if email fails
//       }
//       res.status(200).json({
//         msg: "wait for admin to review and allow your application",
//         data: store,
//       });
//     } catch (err) {
//       console.error("❌ Error creating store:", err);
//       res.status(500).json({ 
//         msg: "store not created", 
//         error: err instanceof Error ? err.message : "Unknown error" 
//       });
//     }
//   }
// );
router.post("/sync-store-products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { store_id, api_key } = req.body;
        // Validate input
        if (!store_id || !api_key) {
            return res.status(400).json({
                msg: "store_id and api_key are required"
            });
        }
        // Check if seller exists
        const seller = yield prisma.seller.findUnique({
            where: { store_id: Number(store_id) }
        });
        if (!seller) {
            return res.status(404).json({
                msg: "Seller not found with this store_id"
            });
        }
        // Fetch products from Printful with retry logic
        let productsData = null;
        const maxRetries = 2;
        let retryCount = 0;
        while (retryCount <= maxRetries && !productsData) {
            try {
                console.log(`🔄 Fetching products from Printful... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
                const productsResponse = yield fetch("https://api.printful.com/store/products", {
                    headers: {
                        authorization: `Bearer ${api_key}`,
                        "X-PF-Store-Id": String(store_id)
                    },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                console.log("📦 Response status:", productsResponse.status);
                if (productsResponse.ok) {
                    const productsJson = yield productsResponse.json();
                    console.log("✅ Products fetched:", ((_a = productsJson.result) === null || _a === void 0 ? void 0 : _a.length) || 0, "products");
                    // Store the products as a JSON string
                    productsData = JSON.stringify(productsJson);
                    break; // Exit retry loop on success
                }
                else {
                    const errorText = yield productsResponse.text();
                    console.warn('⚠️ Could not fetch products from Printful:', productsResponse.status, errorText);
                    retryCount++;
                }
            }
            catch (productError) {
                retryCount++;
                console.error(`⚠️ Error fetching products (Attempt ${retryCount}/${maxRetries + 1}):`, productError instanceof Error ? productError.message : productError);
                if (retryCount <= maxRetries) {
                    console.log(`⏳ Retrying in 2 seconds...`);
                    yield new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
                }
            }
        }
        if (!productsData) {
            return res.status(500).json({
                msg: "Failed to fetch products from Printful after multiple attempts",
                error: "Connection timeout or API error"
            });
        }
        // Update seller with products data
        const updatedSeller = yield prisma.seller.update({
            where: { store_id: Number(store_id) },
            data: { productsData: productsData }
        });
        const productsCount = ((_b = JSON.parse(productsData).result) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return res.status(200).json({
            msg: "Products synced successfully",
            seller: {
                id: updatedSeller.id,
                shopName: updatedSeller.shopName,
                store_id: updatedSeller.store_id
            },
            productsCount: productsCount
        });
    }
    catch (err) {
        console.error("❌ Error syncing store products:", err);
        res.status(500).json({
            msg: "Failed to sync products",
            error: err instanceof Error ? err.message : "Internal server error"
        });
    }
}));
// Add this route to your user routes file
router.post("/add-recently-viewed", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, productId, storeId, productName, productImg, productPrice, variantId } = req.body;
        // Validate input
        if (!userId || !productId || !storeId || !productName || !productImg || !productPrice) {
            return res.status(400).json({
                msg: "Missing required fields"
            });
        }
        // Check if this product was already viewed by this user
        const existingView = yield prisma.recentlyViewedProduct.findFirst({
            where: {
                userId: parseInt(userId),
                productId: parseInt(productId),
                storeId: parseInt(storeId)
            }
        });
        if (existingView) {
            // Update the viewedAt timestamp
            const updated = yield prisma.recentlyViewedProduct.update({
                where: { id: existingView.id },
                data: { viewedAt: new Date() }
            });
            return res.status(200).json({
                msg: "Recently viewed updated",
                data: updated
            });
        }
        // Create new recently viewed record
        const recentlyViewed = yield prisma.recentlyViewedProduct.create({
            data: {
                userId: parseInt(userId),
                productId: parseInt(productId),
                storeId: parseInt(storeId),
                productName: productName,
                productImg: productImg,
                productPrice: parseInt(productPrice),
                variantId: variantId || null
            }
        });
        // Keep only last 20 viewed items per user
        const allViewed = yield prisma.recentlyViewedProduct.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { viewedAt: 'desc' }
        });
        if (allViewed.length > 20) {
            const idsToDelete = allViewed.slice(20).map(item => item.id);
            yield prisma.recentlyViewedProduct.deleteMany({
                where: { id: { in: idsToDelete } }
            });
        }
        return res.status(200).json({
            msg: "Added to recently viewed",
            data: recentlyViewed
        });
    }
    catch (err) {
        console.error("Error adding to recently viewed:", err);
        res.status(500).json({
            msg: "Failed to add to recently viewed",
            error: err instanceof Error ? err.message : "Internal server error"
        });
    }
}));
// Add this route to your user routes file
router.get("/recently-viewed/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        if (!userId) {
            return res.status(400).json({
                msg: "User ID is required"
            });
        }
        const recentlyViewed = yield prisma.recentlyViewedProduct.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { viewedAt: 'desc' },
            take: limit
        });
        return res.status(200).json({
            msg: "Recently viewed products fetched",
            count: recentlyViewed.length,
            data: recentlyViewed
        });
    }
    catch (err) {
        console.error("Error fetching recently viewed:", err);
        res.status(500).json({
            msg: "Failed to fetch recently viewed products",
            error: err instanceof Error ? err.message : "Internal server error"
        });
    }
}));
router.get("/all-merchants-products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🔍 Fetching all merchants with products...");
        // Fetch all sellers from database
        const sellers = yield prisma.seller.findMany({
            select: {
                id: true,
                shopName: true,
                store_id: true,
                logoImg: true,
                description: true,
                productsData: true,
                kybStatus: true,
                isApproved: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        if (sellers.length === 0) {
            return res.status(404).json({
                msg: "No merchants found",
                data: []
            });
        }
        // Process and format the data
        const merchantsWithProducts = sellers.map(seller => {
            let products = [];
            let productsCount = 0;
            // Parse products data if it exists
            if (seller.productsData) {
                try {
                    const parsedData = JSON.parse(seller.productsData);
                    products = parsedData.result || parsedData; // Handle different JSON structures
                    productsCount = Array.isArray(products) ? products.length : 0;
                }
                catch (parseError) {
                    console.error(`⚠️ Error parsing products for store_id ${seller.store_id}:`, parseError);
                    products = [];
                }
            }
            return {
                merchant: {
                    id: seller.id,
                    shopName: seller.shopName,
                    store_id: seller.store_id,
                    logoImg: seller.logoImg,
                    description: seller.description,
                    kybStatus: seller.kybStatus,
                    isApproved: seller.isApproved,
                    createdAt: seller.createdAt
                },
                products: products,
                productsCount: productsCount
            };
        });
        // Calculate total statistics
        const totalMerchants = sellers.length;
        const totalProducts = merchantsWithProducts.reduce((sum, merchant) => sum + merchant.productsCount, 0);
        const merchantsWithProducts_count = merchantsWithProducts.filter(m => m.productsCount > 0).length;
        console.log(`✅ Fetched ${totalMerchants} merchants with ${totalProducts} total products`);
        return res.status(200).json({
            msg: "All merchants products fetched successfully",
            statistics: {
                totalMerchants: totalMerchants,
                merchantsWithProducts: merchantsWithProducts_count,
                merchantsWithoutProducts: totalMerchants - merchantsWithProducts_count,
                totalProducts: totalProducts
            },
            data: merchantsWithProducts
        });
    }
    catch (err) {
        console.error("❌ Error fetching all merchants products:", err);
        res.status(500).json({
            msg: "Failed to fetch merchants products",
            error: err instanceof Error ? err.message : "Internal server error"
        });
    }
}));
router.post('/verify-printful-api', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("requrest reached here ");
        const { api_key } = req.body;
        if (!api_key) {
            return res.status(400).json({
                success: false,
                message: 'API key is required'
            });
        }
        // Call Printful API from backend
        const response = yield fetch('https://api.printful.com/stores', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Printful API Key'
            });
        }
        const data = yield response.json();
        if (data.result && data.result.length > 0) {
            return res.json({
                success: true,
                result: data.result,
                message: 'API key verified successfully'
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'No stores found for this API key'
            });
        }
    }
    catch (error) {
        console.error('Error verifying Printful API:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to verify API key. Please try again.'
        });
    }
}));
// route ot return all the available stores 
router.get('/get-all-stores', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all_stores = yield getAllStores();
        res.status(200).json({ msg: "return all approved stores", data: all_stores });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
router.get('/dashboard-metrics', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const metrics = yield getDashboardMetrics();
        res.status(200).json({
            msg: "Dashboard metrics retrieved successfully",
            metrics: metrics
        });
    }
    catch (err) {
        console.error("Error fetching dashboard metrics:", err);
        res.status(500).json({ msg: "Failed to fetch dashboard metrics", error: err });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        let merchants;
        if (status && typeof status === 'string') {
            // Validate status
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'];
            const upperStatus = status.toUpperCase();
            if (!validStatuses.includes(upperStatus)) {
                return res.status(400).json({ msg: "Invalid status parameter" });
            }
            merchants = yield getMerchantsByStatus(upperStatus);
        }
        else {
            merchants = yield getAllMerchants();
        }
        // Transform data to match frontend expectations
        const formattedMerchants = merchants.map(merchant => {
            // Map KYBStatus to frontend verification_status
            let verification_status;
            switch (merchant.kybStatus) {
                case 'PENDING':
                    verification_status = 'pending';
                    break;
                case 'APPROVED':
                    verification_status = 'approved';
                    break;
                case 'REJECTED':
                    verification_status = 'rejected';
                    break;
                case 'UNDER_REVIEW':
                    verification_status = 'under_review';
                    break;
                default:
                    verification_status = 'pending';
            }
            return {
                id: merchant.id.toString(),
                name: merchant.shopName,
                category: "General", // Add category field to schema if needed
                city: merchant.businessAddress || "N/A",
                phone: merchant.contactNumber || "N/A",
                email: merchant.businessEmail,
                verification_status: verification_status,
                created_at: merchant.createdAt.toISOString()
            };
        });
        res.status(200).json({
            msg: "Merchants retrieved successfully",
            merchants: formattedMerchants
        });
    }
    catch (err) {
        console.error("Error fetching merchants:", err);
        res.status(500).json({ msg: "Failed to fetch merchants", error: err });
    }
}));
router.get('/pending', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchants = yield getPendingMerchants();
        // Transform data to match frontend expectations
        const formattedMerchants = merchants.map(merchant => ({
            id: merchant.id.toString(),
            name: merchant.shopName,
            category: "General", // You may want to add a category field to your schema
            city: merchant.businessAddress || "N/A",
            phone: merchant.contactNumber || "N/A",
            email: merchant.businessEmail,
            created_at: merchant.createdAt.toISOString()
        }));
        res.status(200).json({
            msg: "Pending merchants retrieved successfully",
            merchants: formattedMerchants
        });
    }
    catch (err) {
        console.error("Error fetching pending merchants:", err);
        res.status(500).json({ msg: "Failed to fetch pending merchants", error: err });
    }
}));
// Get merchant details by ID
router.get('/:merchantId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchantId = parseInt(req.params.merchantId);
        if (isNaN(merchantId)) {
            return res.status(400).json({ msg: "Invalid merchant ID" });
        }
        const merchant = yield getMerchantById(merchantId);
        if (!merchant) {
            return res.status(404).json({ msg: "Merchant not found" });
        }
        res.status(200).json({
            msg: "Merchant details retrieved successfully",
            merchant: merchant
        });
    }
    catch (err) {
        console.error("Error fetching merchant details:", err);
        res.status(500).json({ msg: "Failed to fetch merchant details", error: err });
    }
}));
// Update merchant verification status
router.patch('/:merchantId/verification', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchantId = parseInt(req.params.merchantId);
        const { verification_status, rejection_reason } = req.body;
        if (isNaN(merchantId)) {
            return res.status(400).json({ msg: "Invalid merchant ID" });
        }
        if (!verification_status || !['approved', 'rejected'].includes(verification_status)) {
            return res.status(400).json({ msg: "Invalid verification status" });
        }
        const updatedMerchant = yield updateMerchantVerification(merchantId, verification_status, rejection_reason);
        res.status(200).json({
            msg: `Merchant ${verification_status} successfully`,
            merchant: updatedMerchant
        });
    }
    catch (err) {
        console.error("Error updating merchant verification:", err);
        res.status(500).json({ msg: "Failed to update merchant verification", error: err });
    }
}));
// route to takes a store_id and get's all the product offered by him 
router.get("/store-products/:store_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store_id = req.params.store_id;
        const store = yield getstoreApiKey(Number(store_id));
        const products = yield fetch("https://api.printful.com/store/products", {
            headers: {
                authorization: `Bearer ${store === null || store === void 0 ? void 0 : store.api_key}`,
                "X-PF-Store-Id": store_id
            }
        });
        if (!products.ok) {
            return res.status(products.status).json({
                msg: "Failed to fetch products from Printful"
            });
        }
        const data = yield products.json();
        return res.status(200).json({ msg: "store found", store: store, data: data });
    }
    catch (err) {
        console.error("Error fetching store products:", err);
        res.status(500).json({
            msg: err instanceof Error ? err.message : "Internal server error"
        });
    }
}));
router.get("/single-product/:store_id/:product_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("request reached here");
        const store_id = req.params.store_id;
        const product_id = req.params.product_id;
        // Get store API key from database
        const store = yield getstoreApiKey(Number(store_id));
        if (!store || !store.api_key) {
            return res.status(404).json({
                success: false,
                msg: "Store not found or API key not configured"
            });
        }
        const api_key = store.api_key;
        // Fetch product details from Printful API
        const response = yield fetch(`https://api.printful.com/store/products/${product_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${api_key}`,
                "Content-Type": "application/json",
                "X-PF-Store-Id": store_id
            }
        });
        if (!response.ok) {
            const errorData = yield response.json();
            return res.status(response.status).json({
                success: false,
                msg: "Failed to fetch product from Printful",
                error: errorData
            });
        }
        const productData = yield response.json();
        // Return the product details
        res.status(200).json({
            success: true,
            data: productData.result,
            store: {
                id: store.id,
                shopName: store.shopName,
                logoImg: store.logoImg
            }
        });
    }
    catch (err) {
        console.error("Error fetching single product:", err);
        res.status(500).json({
            success: false,
            msg: "Internal server error",
            error: err instanceof Error ? err.message : err
        });
    }
}));
router.post("/add-printfull-product-to-cart/:store_id/:product_id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("=== Add to Cart Request Started ===");
        console.log("Params:", req.params);
        console.log("Body:", req.body);
        // Validate required parameters
        const store_id = Number(req.params.store_id);
        const product_id = Number(req.params.product_id);
        const userId = Number(req.body.userId);
        const variant_id = String(req.body.variant_id);
        const quantity = req.body.quantity ? Number(req.body.quantity) : 1;
        const productImg = req.body.productImg;
        const productName = req.body.productName;
        const productPrice = Number(req.body.productPrice);
        // Check for invalid numbers
        if (isNaN(store_id) || store_id <= 0) {
            console.error("Invalid store_id:", req.params.store_id);
            return res.status(400).json({
                success: false,
                msg: "Invalid store ID provided"
            });
        }
        if (isNaN(product_id) || product_id <= 0) {
            console.error("Invalid product_id:", req.params.product_id);
            return res.status(400).json({
                success: false,
                msg: "Invalid product ID provided"
            });
        }
        if (isNaN(userId) || userId <= 0) {
            console.error("Invalid userId:", req.body.userId);
            return res.status(400).json({
                success: false,
                msg: "Invalid user ID provided"
            });
        }
        // Fixed validation: Check if variant_id exists and is not empty
        if (!variant_id || variant_id.trim() === '') {
            console.error("Invalid variant_id:", req.body.variant_id);
            return res.status(400).json({
                success: false,
                msg: "Invalid variant ID provided"
            });
        }
        if (isNaN(quantity) || quantity <= 0) {
            console.error("Invalid quantity:", req.body.quantity);
            return res.status(400).json({
                success: false,
                msg: "Quantity must be a positive number"
            });
        }
        // Validate required string fields
        if (!productImg || !productName) {
            console.error("Missing required fields - productImg:", productImg, "productName:", productName);
            return res.status(400).json({
                success: false,
                msg: "Product image and name are required"
            });
        }
        if (isNaN(productPrice) || productPrice <= 0) {
            console.error("Invalid productPrice:", req.body.productPrice);
            return res.status(400).json({
                success: false,
                msg: "Invalid product price provided"
            });
        }
        const payload = {
            store_id,
            product_id,
            userId,
            variant_id,
            quantity,
            productImg,
            productName,
            productPrice
        };
        console.log("Validated payload:", payload);
        const addToUsersCart = yield addToprintfullCart(payload);
        console.log("Cart item added successfully:", addToUsersCart);
        console.log("=== Add to Cart Request Completed ===");
        res.status(200).json({
            success: true,
            msg: "Product added to cart successfully",
            data: addToUsersCart
        });
    }
    catch (err) {
        console.error("=== Add to Cart Error ===");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("Request params:", req.params);
        console.error("Request body:", req.body);
        console.error("===========================");
        // Handle specific Prisma errors
        if (err.code === 'P2002') {
            return res.status(409).json({
                success: false,
                msg: "This item is already in your cart"
            });
        }
        if (err.code === 'P2003') {
            return res.status(404).json({
                success: false,
                msg: "Product or user not found"
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                msg: "Cart not found for user"
            });
        }
        // Handle custom errors
        if (err.message === "Cart not found for user") {
            return res.status(404).json({
                success: false,
                msg: "User cart not found. Please create a cart first."
            });
        }
        // Generic error response
        res.status(500).json(Object.assign({ success: false, msg: "Failed to add product to cart. Please try again." }, (process.env.NODE_ENV === 'development' && { error: err.message })));
    }
}));
router.delete("/cart-item/:cartItemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.userId;
        console.log("this is the userId", userId);
        const cartItemId = Number(req.params.cartItemId);
        console.log("this is the cartItemId", cartItemId);
        const payload = {
            userId: userId,
            cartItemId: cartItemId
        };
        const deletedFromCartItem = yield deleteCartItemFromCart(payload);
        console.log(deletedFromCartItem);
        res.status(200).json({ msg: "product Deleted from the cart" });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
router.patch("/cart-item/:cartItemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("requres reached here");
        const quantity = Number(req.body.quantity);
        const cartItemId = Number(req.params.cartItemId);
        const payload = {
            quantity: quantity,
            cartItemId: cartItemId
        };
        const updatedCart = yield updateQuantityinCart(payload);
        res.status(200).json({ msg: "quantity in the cart updated" });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
export default router;
router.get("/store/:storeId/wallet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("searching the seller's wallet address");
        const { storeId } = req.params;
        ;
        const seller = yield getStoreWalletAddress(Number(storeId));
        console.log(seller);
        res.status(200).json({ msg: "wallet address found", walletAddress: seller === null || seller === void 0 ? void 0 : seller.walletAddress });
    }
    catch (err) {
        res.status(200).json({ msg: err });
    }
}));
router.patch('/order-item/:orderItemId/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderItemId } = req.params;
    const { status } = req.body;
    const payload = {
        orderItemId,
        status
    };
    const updatedItem = yield updateOrderStatus(payload);
    res.json({ success: true, orderItem: updatedItem });
}));
router.get("/store_api_key/:storeId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storeId = Number(req.params.storeId);
        const store = yield getstoreApiKey(storeId);
        res.status(200).json({ apiKey: store === null || store === void 0 ? void 0 : store.api_key });
    }
    catch (err) {
        res.status(500).json({ msg: err });
    }
}));
