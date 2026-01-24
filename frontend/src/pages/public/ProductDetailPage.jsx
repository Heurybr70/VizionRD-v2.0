import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getProduct } from '../../services/firestore.service';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });


  // Mapear image a imageUrl igual que en ProductsPage
  const product = data?.data ? { ...data.data, imageUrl: data.data.image || data.data.imageUrl } : undefined;
  // (Eliminado log de depuración para mayor seguridad y privacidad)

  if (isLoading) return <LoadingSpinner />;
  if (error || !product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <Link to="/productos" className="text-primary underline">Volver al catálogo</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Helmet>
        <title>{product.name} | VizionRD</title>
        <meta name="description" content={product.description?.slice(0, 150)} />
      </Helmet>
      <Navbar />
      <main className="flex-1 container-custom pt-28 pb-10 md:pt-32 md:pb-20">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 flex items-center justify-center">
            <img
              src={product.imageUrl || product.image || '/placeholder-product.jpg'}
              alt={product.name}
              className="max-h-96 w-auto object-contain rounded"
            />
          </div>
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                {product.name}
              </h1>
              {/* Dynamic Fields - ficha técnica elegante */}
              {Array.isArray(product.dynamicFields) && product.dynamicFields.length > 0 && (
                <div className="mb-6">
                  <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow p-4 border border-slate-200 dark:border-slate-700 max-w-xl">
                    <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base align-middle">list_alt</span>
                      Ficha Técnica
                    </h2>
                    <dl className="divide-y divide-slate-200 dark:divide-slate-700">
                      {product.dynamicFields.map((field, idx) => (
                        <div key={idx} className="flex flex-row items-center py-2 gap-4">
                          <dt className="w-48 text-sm font-medium text-slate-700 dark:text-slate-200 flex-shrink-0">{field.label}</dt>
                          <dd className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-semibold">{field.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
              <p className="text-lg text-slate-900 dark:text-slate-300 mb-4 mt-2">{product.description}</p>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-primary mr-2">
                {product.price ? `$${product.price}` : 'Precio a consultar'}
              </span>
              {product.comparePrice && (
                <span className="text-lg line-through text-slate-400">${product.comparePrice}</span>
              )}
            </div>
            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                {product.category || 'Sin categoría'}
              </span>
            </div>
            <Link 
              to={`/contacto?subject=Solicitud%20de%20Informaci%C3%B3n%20de%20${encodeURIComponent(product.name)}`}
              className="btn btn-primary mt-6"
            >
              Solicitar información
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
