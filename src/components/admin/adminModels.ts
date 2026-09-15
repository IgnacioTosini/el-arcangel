// Definiciones de los ocho modelos de prisma/schema.prisma.
export type ModelName = 'Category' | 'Product' | 'ProductVariant' | 'ProductImage' | 'Cart' | 'CartItem' | 'Order' | 'OrderItem';
export type AdminField = { name: string; type: string; required: boolean; unique: boolean; readonly: boolean; options?: string[]; relation?: ModelName };
export type AdminModel = { name: ModelName; slug: string; label: string; fields: AdminField[] };
export type AdminRecord = { id: string; [key: string]: string | number | boolean | null };
export type AdminData = Record<ModelName, AdminRecord[]>;
export const adminModels: AdminModel[] = [
  {
    "name": "Category",
    "slug": "categorias",
    "label": "Categorías",
    "fields": [
      {
        "name": "id",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "name",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "slug",
        "type": "String",
        "required": true,
        "unique": true,
        "readonly": false
      },
      {
        "name": "description",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "imageUrl",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "publicId",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "sortOrder",
        "type": "Int",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "active",
        "type": "Boolean",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "createdAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "updatedAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      }
    ]
  },
  {
    "name": "Product",
    "slug": "productos",
    "label": "Productos",
    "fields": [
      {
        "name": "id",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "name",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "slug",
        "type": "String",
        "required": true,
        "unique": true,
        "readonly": false
      },
      {
        "name": "description",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "material",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "featured",
        "type": "Boolean",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "active",
        "type": "Boolean",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "createdAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "updatedAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      }
    ]
  },
  {
    "name": "ProductVariant",
    "slug": "variantes",
    "label": "Variantes",
    "fields": [
      {
        "name": "id",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "sku",
        "type": "String",
        "required": true,
        "unique": true,
        "readonly": false
      },
      {
        "name": "name",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "aroma",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "color",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "size",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "presentation",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "price",
        "type": "Decimal",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "compareAtPrice",
        "type": "Decimal",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "stock",
        "type": "Int",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "active",
        "type": "Boolean",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "sortOrder",
        "type": "Int",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "productId",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false,
        "relation": "Product"
      },
      {
        "name": "createdAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "updatedAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      }
    ]
  },
  {
    "name": "ProductImage",
    "slug": "imagenes",
    "label": "Imágenes",
    "fields": [
      {
        "name": "id",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "url",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "publicId",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "alt",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "sortOrder",
        "type": "Int",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "productId",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false,
        "relation": "Product"
      },
      {
        "name": "createdAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "updatedAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      }
    ]
  },
  {
    "name": "Cart",
    "slug": "carritos",
    "label": "Carritos",
    "fields": [
      {
        "name": "id",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "sessionTokenHash",
        "type": "String",
        "required": true,
        "unique": true,
        "readonly": true
      },
      {
        "name": "purchaseType",
        "type": "PurchaseType",
        "required": true,
        "unique": false,
        "readonly": false,
        "options": [
          "RETAIL",
          "WHOLESALE"
        ]
      },
      {
        "name": "expiresAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "createdAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "updatedAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      }
    ]
  },
  {
    "name": "CartItem",
    "slug": "articulos-carrito",
    "label": "Artículos de carrito",
    "fields": [
      {
        "name": "id",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "quantity",
        "type": "Int",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "cartId",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false,
        "relation": "Cart"
      },
      {
        "name": "variantId",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false,
        "relation": "ProductVariant"
      },
      {
        "name": "createdAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "updatedAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      }
    ]
  },
  {
    "name": "Order",
    "slug": "pedidos",
    "label": "Pedidos y consultas",
    "fields": [
      {
        "name": "id",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "number",
        "type": "Int",
        "required": true,
        "unique": true,
        "readonly": true
      },
      {
        "name": "idempotencyKey",
        "type": "String",
        "required": true,
        "unique": true,
        "readonly": true
      },
      {
        "name": "customerName",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "customerPhone",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "businessName",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "customerNote",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "adminNote",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "status",
        "type": "OrderStatus",
        "required": true,
        "unique": false,
        "readonly": false,
        "options": [
          "PENDING",
          "COMPLETED",
          "INQUIRY_ONLY",
          "CANCELLED"
        ]
      },
      {
        "name": "purchaseType",
        "type": "PurchaseType",
        "required": true,
        "unique": false,
        "readonly": false,
        "options": [
          "RETAIL",
          "WHOLESALE"
        ]
      },
      {
        "name": "estimatedTotal",
        "type": "Decimal",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "finalTotal",
        "type": "Decimal",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "completedAt",
        "type": "DateTime",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "createdAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "updatedAt",
        "type": "DateTime",
        "required": true,
        "unique": false,
        "readonly": true
      }
    ]
  },
  {
    "name": "OrderItem",
    "slug": "articulos-pedido",
    "label": "Artículos de pedido",
    "fields": [
      {
        "name": "id",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": true
      },
      {
        "name": "quantity",
        "type": "Int",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "productName",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "variantName",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "sku",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false
      },
      {
        "name": "unitPrice",
        "type": "Decimal",
        "required": false,
        "unique": false,
        "readonly": false
      },
      {
        "name": "orderId",
        "type": "String",
        "required": true,
        "unique": false,
        "readonly": false,
        "relation": "Order"
      },
      {
        "name": "variantId",
        "type": "String",
        "required": false,
        "unique": false,
        "readonly": false,
        "relation": "ProductVariant"
      }
    ]
  }
];
