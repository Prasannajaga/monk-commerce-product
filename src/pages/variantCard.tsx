 
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import type { addProduct } from './products'
import  update  from 'immutability-helper' 
import { HTML5Backend } from 'react-dnd-html5-backend'
import ProductCard from './productsCard'

export const ItemTypes = {
  CARD: 'card',
} 
 

export type CardProps  = Partial<addProduct> & {
  id: any 
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
  removeProduct: (hoverIndex: number) => void
}
 

const VariantCard: FC<CardProps | any> = ({ variants, productIndex , onVarChange} : CardProps | any) => {

    const [variantsData, setVariants] = useState<addProduct[]>(variants);

    useEffect(()=>{
    setVariants(variants);
    console.log(variants ,variantsData);
    }, [variants])


    const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
        setVariants((prevCards: any[]) =>
        update(prevCards, {
            $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex] as addProduct],
            ],
        }))
        onVarChange(productIndex , variantsData);
    }, []) 
  
  const removeCard = useCallback(() => {

  } , []);

  const removeVar = useCallback(() => {

  } , []);
 
  return (
    <>
        <section>
            <DndProvider backend={HTML5Backend}>  
                {variantsData?.filter(x => x.selected).map(( {id , title , price , discount, discountType }  : any, index : number) => ( 
                     <ProductCard  
                        id={id}
                        index={index}
                        title={title}
                        discount={discount}
                        discountType={discountType}
                        moveCard={moveCard}
                        removeProduct={removeCard} 
                  > </ProductCard>
                ))}
            </DndProvider>
        </section>
    </>
  )
}


export default VariantCard;