
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


const VariantCard: FC<CardProps | any> = ({ variants, onEdit  , onVarChange , productId}: CardProps | any) => {

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
  }, []);

  const removeVar = useCallback((id: number) => {
    setVariants(prev => prev.filter(x => x.id != id));
    onVarChange(productId , variantsData);
  }, []);

  const onChange = useCallback((id : number , data : any) => { 
      setVariants(prev =>{
        return prev.map(x => {
          if(x.id === id){
            x.title = data.title;
            x.discount = data.discount;
            x.discountType = data.discountType;
          }
          return x
        })
      });
  }, []);

  return (
    <> 
        {variantsData?.filter(x => x.selected).map((variant : any, index: number) => (
          <div  key={variant.id + index}>
            <ProductCard
              id={variant.id}
              index={index}
              title={variant.title}
              price={variant.price}
              type={"VARIANT"}
              discount={variant.discount}
              discountType={variant.discountType}
              moveCard={moveCard}
              removeProduct={removeVar}
              isSmall={true}
              onChange={onChange}
              onEdit={onEdit} 
            > </ProductCard>
          </div>
        ))}  
    </>
  )
}


export default VariantCard;