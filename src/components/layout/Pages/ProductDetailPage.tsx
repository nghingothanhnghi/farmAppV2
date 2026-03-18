import React, { useEffect, useState } from 'react';
import { useParams } from "react-router";
import { API_BASE_URL } from '../../../config/constants';
import Spinner from '../../common/Spinner';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products/${id}`)
      .then(res => res.json())
      .then(setProduct);
  }, [id]);

  if (!product) return <Spinner size={48} colorClass="border-white" borderClass="border-4" />;

  return (
    <div>
      <h1>{product.name}</h1>
      <img src={product.image_url} alt={product.name} />
      <p>{product.description}</p>
    </div>
  );
}


export default ProductDetailPage;
