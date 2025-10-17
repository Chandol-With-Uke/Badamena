import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { ProductsChart } from "./components/ProductsChart";
import { CREATE_PRODUCT, DELETE_PRODUCT, GET_PRODUCTS, UPDATE_PRODUCT, type Product } from "./lib/gql";


function App() {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [nameInput, setNameInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [priceInput, setPriceInput] = useState("");

  const openAddDialog = () => {
    setIsEditMode(false);
    setNameInput("");
    setDescInput("");
    setPriceInput("");
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setIsEditMode(true);
    setNameInput(product.name);
    setDescInput(product.description);
    setPriceInput(product.price.toString());
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setNameInput("");
    setDescInput("");
    setPriceInput("");
    setSelectedProduct(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct({ variables: { id } });
      toast.success("Produit supprimé avec succès");
      refetch();
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!nameInput || !priceInput) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const variables = {
      name: nameInput,
      description: descInput,
      price: parseFloat(priceInput),
    };

    try {
      if (isEditMode && selectedProduct) {
        await updateProduct({ variables: { id: selectedProduct.id, ...variables } });
        toast.success("Produit modifié avec succès");
      } else {
        await createProduct({ variables });
        toast.success("Produit ajouté avec succès");
      }
      refetch();
      closeDialog();
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400 max-w-md truncate">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Prix</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(amount);
        return (
          <div className="text-right font-semibold text-green-600 dark:text-green-400">
            {formatted}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        const [open, setOpen] = useState(false);
    
        return (
          <div className="text-right">
            <button 
              onClick={() => setOpen(!open)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setOpen(false);
                      openEditDialog(product);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </button>
                  <button 
                    onClick={() => {
                      setOpen(false);
                      handleDelete(product.id);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.products || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-950">
        <Card className="max-w-md mx-4 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-12 text-center relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Sparkles className="w-64 h-64 text-purple-500" />
          </div>
          <h1 className="relative text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Dashboard Baka Toliara
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gérez vos produits avec élégance et efficacité
          </p>
        </header>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            size="lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Ajouter un Produit
          </Button>
        </div>
        <div className="grid gap-8 mt-8">

        {/* Products Card */}
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Liste des Produits
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {data?.products?.length || 0} produit(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  Chargement des produits...
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          Aucun produit trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        
        
          {/* Le nouveau graphique */}
          <ProductsChart products={data?.products || []} />
        </div>
        {/* Product Dialog (Add/Edit) */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {isEditMode ? "Modifier le produit" : "Ajouter un produit"}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Modifiez les informations du produit sélectionné"
                  : "Remplissez les informations pour créer un nouveau produit"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nom du produit *
                </Label>
                <Input
                  id="name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ex: Laptop Dell XPS 13"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Input
                  id="description"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Description détaillée du produit"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Prix (€) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isEditMode ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster richColors position="bottom-right" />
      </div>
    </div>
  );
}

export default App;