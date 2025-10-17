import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface ProductsChartProps {
  products: Product[];
}

export function ProductsChart({ products }: ProductsChartProps) {
  // Préparer les données pour le graphique
  const chartData = products.map(product => ({
    name: product.name.length > 15 ? `${product.name.substring(0, 15)}...` : product.name,
    fullName: product.name,
    price: product.price,
    description: product.description
  }));

  // Configuration du tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{data.fullName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Prix: <span className="font-semibold text-green-600">{data.price} €</span>
          </p>
          {data.description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 max-w-xs">
              {data.description.length > 100 
                ? `${data.description.substring(0, 100)}...`
                : data.description
              }
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Prix des Produits
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Répartition des prix de vos produits
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {products.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value} €`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="price" 
                  fill="url(#colorGradient)" 
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg">Aucune donnée disponible</p>
            <p className="text-sm">Ajoutez des produits pour voir le graphique</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}