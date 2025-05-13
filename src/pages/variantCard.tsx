
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react' 
import type { addProduct } from './products'
import update from 'immutability-helper'  
import ProductCard from './productsCard'
import type { productVariant } from '@/models/model'

export const ItemTypes = {
  CARD: 'card',
}


export type CardProps = Partial<addProduct> & {
  id: any
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
  removeProduct: (hoverIndex: number) => void
}


const VariantCard: FC<CardProps | any> = ({ variants, onEdit }: CardProps | any) => {

  const [variantsData, setVariants] = useState<any[]>(variants);

  useEffect(() => {
    setVariants(variants); 
  }, [variants])


  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setVariants((prevCards: any[]) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex] as productVariant],
        ],
    })); 
  }, [])

  const removeVar = useCallback((id: number) => {
    setVariants(prev => prev.filter(x => x.id != id));
  }, []);


  return (
    <>
      {variantsData?.filter(x => x.selected).map(({ id, title, price, discount, discountType }: any, index: number) => (
        <div key={id + index}>
          <ProductCard
            id={id}
            index={index}
            title={title}
            price={price}
            discount={discount}
            discountType={discountType}
            moveCard={moveCard}
            removeProduct={removeVar}
            isSmall={true}
            onEdit={onEdit} 
          > </ProductCard>
        </div>
      ))}
    </>
  )
}


export default VariantCard;