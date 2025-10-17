import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Toaster, toast } from "sonner";

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
    }
  }
`;

// Rénommer la mutation pour correspondre au backend: createProduct
const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $price: Float!
  ) {
    createProduct(
      product: { name: $name, description: $description, price: $price }
    ) {
      id
      name
      description
      price
    }
  }
`;

// Rénommer la mutation pour correspondre au backend: updateProduct
const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String!
    $description: String!
    $price: Float!
  ) {
    updateProduct(
      id: $id
      product: { name: $name, description: $description, price: $price }
    ) {
      id
      name
      description
      price
    }
  }
`;

// Rénommer la mutation pour correspondre au backend: deleteProduct
const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

function App() {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  // Utiliser les nouvelles constantes de mutation
  const [createProduct] = useMutation(CREATE_PRODUCT_MUTATION);
  const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION);
  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null,
  );
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Nom", // Traduction
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "price",
      header: "Prix", // Traduction
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>{" "}
                {/* Traduction */}
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProduct(product);
                  setEditDialogOpen(true);
                }}
              >
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  deleteProduct({ variables: { id: product.id } })
                    .then(() => {
                      toast.success("Produit supprimé avec succès."); // Traduction
                      refetch();
                    })
                    .catch((error) => {
                      toast.error(
                        `Erreur lors de la suppression: ${error.message}`,
                      ); // Message d'erreur plus spécifique et traduit
                    });
                }}
                className="text-red-600 focus:bg-red-50 focus:text-red-600" // Style pour l'action de suppression
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.products || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-red-600">
        <p className="text-xl font-semibold">
          Erreur de chargement des données: {error.message}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section d'en-tête et titre du dashboard */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 sm:text-6xl lg:text-7xl mb-4">
            Dashboard Baka Toliara
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gérez vos produits avec efficacité. Une interface moderne et
            réactive pour votre entreprise.
          </p>
        </header>
        {/* Bouton d'ajout de produit */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 text-lg"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Ajouter un Produit</span>
          </Button>
        </div>
        {/* Carte des produits */}
        <Card className="shadow-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <CardTitle className="text-2xl font-bold">
              Liste des Produits
            </CardTitle>{" "}
            {/* Traduit */}
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Visualisez et gérez l'ensemble de vos produits.{" "}
              {/* Traduit */}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  Chargement des produits... {/* Traduit */}
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader className="bg-gray-100 dark:bg-gray-700">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead
                              key={header.id}
                              className="font-semibold text-gray-700 dark:text-gray-200"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="even:bg-gray-50 even:dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-3">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-gray-500 dark:text-gray-400"
                        >
                          Aucun résultat trouvé. {/* Traduit */}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Add Product Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau produit</DialogTitle>{" "}
              {/* Traduit */}
              <DialogDescription>
                Remplissez les informations ci-dessous pour ajouter un
                produit. {/* Traduit */}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;
                const description = formData.get("description") as string;
                const price = parseFloat(formData.get("price") as string);

                createProduct({
                  // Utilisation de createProduct ici
                  variables: {
                    name,
                    description,
                    price,
                  },
                })
                  .then(() => {
                    toast.success("Produit ajouté avec succès."); // Traduit
                    refetch();
                    setAddDialogOpen(false);
                  })
                  .catch((error) => {
                    toast.error(`Erreur lors de l'ajout: ${error.message}`); // Traduit
                  });
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nom
                  </Label>{" "}
                  {/* Traduit */}
                  <Input
                    id="name"
                    name="name"
                    className="col-span-3"
                    required // Validation
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>{" "}
                  {/* Traduit */}
                  <Input
                    id="description"
                    name="description"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Prix
                  </Label>{" "}
                  {/* Traduit */}
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01" // Validation
                    className="col-span-3"
                    required // Validation
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enregistrer le produit</Button>{" "}
                {/* Traduit */}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <DialogHeader>
              <DialogTitle>Modifier le produit</DialogTitle> {/* Traduit */}
              <DialogDescription>
                Mettez à jour les informations du produit sélectionné.{" "}
                {/* Traduit */}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;
                const description = formData.get("description") as string;
                const price = parseFloat(formData.get("price") as string);

                if (selectedProduct) {
                  updateProduct({
                    variables: {
                      id: selectedProduct.id,
                      name,
                      description,
                      price,
                    },
                  })
                    .then(() => {
                      toast.success("Produit mis à jour avec succès."); // Traduit
                      refetch();
                      setEditDialogOpen(false);
                    })
                    .catch((error) => {
                      toast.error(
                        `Erreur lors de la mise à jour: ${error.message}`,
                      ); // Traduit
                    });
                }
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nom
                  </Label>{" "}
                  {/* Traduit */}
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedProduct?.name}
                    className="col-span-3"
                    required // Validation
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>{" "}
                  {/* Traduit */}
                  <Input
                    id="description"
                    name="description"
                    defaultValue={selectedProduct?.description}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Prix
                  </Label>{" "}
                  {/* Traduit */}
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01" // Validation
                    defaultValue={selectedProduct?.price}
                    className="col-span-3"
                    required // Validation
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Enregistrer les modifications</Button>{" "}
                {/* Traduit */}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Toaster richColors position="bottom-right" />{" "}
        {/* Ajout de richColors pour de meilleurs toasts */}
      </div>
    </div>
  );
}

export default App;
