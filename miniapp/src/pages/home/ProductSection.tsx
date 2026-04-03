import ProductCard, { type ProductCardData } from './ProductCard';

interface ProductSectionProps {
  products: ProductCardData[];
  showPagination?: boolean;
}

export default function ProductSection({ products, showPagination = false }: ProductSectionProps) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      {products.map((product) => (
        <ProductCard key={product.code} {...product} />
      ))}

      {showPagination && (
        <div data-testid="pagination" className="flex justify-center py-1">
          <div className="flex items-center gap-1 rounded-full bg-border px-0.5 py-0.5">
            <div className="h-2 w-5 rounded-full bg-destructive" />
            <div className="h-2 w-2 rounded-full opacity-40" />
          </div>
        </div>
      )}
    </div>
  );
}
