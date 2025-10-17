import { gql } from "@apollo/client";

// GraphQL Queries & Mutations
export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $description: String!, $price: Float!) {
    createProduct(product: { name: $name, description: $description, price: $price }) {
      id
      name
      description
      price
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $name: String!, $description: String!, $price: Float!) {
    updateProduct(id: $id, product: { name: $name, description: $description, price: $price }) {
      id
      name
      description
      price
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};