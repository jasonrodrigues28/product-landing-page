// src/configs/product.config.js

export const productConfig = {
  fields: {
    title: {
      label: "Product Title",
      placeholder: "Enter product name",
      maxLength: 50
    },

    description: {
      label: "Description",
      placeholder: "Enter short description",
      maxLength: 200
    },

    price: {
      label: "Price (₹)",
      min: 1,
      max: 100000
    },

    image: {
      label: "Upload Product Image",
      acceptedTypes: ["image/jpeg", "image/png"]
    }
  },

  buttons: {
    upload: "Upload Product",
    update: "Update Product",
    delete: "Delete Product"
  },

  messages: {
    success: "Product saved successfully!",
    error: "Something went wrong. Please try again."
  }
};
