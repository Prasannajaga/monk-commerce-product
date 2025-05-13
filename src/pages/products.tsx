import React, { useCallback, useState } from 'react'; 
import { ChevronDown, ChevronUp } from 'lucide-react';
 import { Button } from '@/components/ui/button'; 
import DialogModal from './dialog';
import type { Product, productVariant } from '@/models/model';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProductCard from './productsCard';
import  update  from 'immutability-helper' 
import VariantCard from './variantCard';

 
export type addProduct = Partial<Product & {
  discount : string
  discountType : string,
  selected: boolean
}>

  const Products: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<addProduct[]>([
    {
      id : 0,
      title : "Select Product",
      discount : "0",
      discountType : "% Off"
    }
  ]);  
 
  const onShowVariant = (product : addProduct) =>{
    product.selected = product.selected === undefined ? true : !product.selected;
    setProducts(prev => [...prev]);
  }

  const onProductAdd = useCallback((data : addProduct[]) =>{ 
    setProducts([...data]);
  } , []);


  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
      setProducts((prevCards: addProduct[]) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex] as addProduct],
          ],
        }),
      )
  }, []) 

  const removeProduct = useCallback((id : number) => {
      setProducts(prev => prev.filter(x=>x.id != id));
  } , []);

  const onClose = useCallback((v:boolean) => {
      setOpen(v);
  } , []);

  const onEdit = useCallback((v:boolean) => {
      setOpen(v);
  } , []);

  const onVarChange = useCallback((prId : number , data : productVariant[]) => {
      const pData = products[prId];
      pData.variants = data;
      setProducts(prev => [...prev]);
  } , []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Add Products</h2>
      <div className="flex flex-col gap-2">
           <DndProvider backend={HTML5Backend}> 
              {products.map((product, index) => (
                <section  key={product.id}> 
                  
                  <ProductCard  
                    id={product.id}
                    index={index}
                    title={product.title}
                    discount={product.discount ?? 0}
                    discountType={product.discountType}
                    moveCard={moveCard}
                    removeProduct={removeProduct}
                    onEdit={onEdit} 
                  > </ProductCard> 

                  <div className='flex w-full  flex-col gap-4 justify-self-end  cursor-pointer' >
                      <p onClick={() => onShowVariant(product)} className='text-blue-400 flex self-end underline mr-7'> {product.selected ? 'Hide' : 'Show '} variants {product.selected ?  <ChevronUp /> : <ChevronDown />}</p> 
                      <section className={`flex flex-col gap-2 items-end ${product.selected ? 'block' : 'hidden'}`}>
                         {product?.variants && product.variants.filter(d => d.selected)?.length > 0 ?
                            <VariantCard 
                              variants={product.variants}
                              productIndex={index}
                              onVarChange={onVarChange} 
                              onEdit={onEdit} 
                            ></VariantCard> 
                          : 
                          <div className='self-center'>No variants found</div> 
                         }
                      </section> 
                  </div>
                </section> 
              ))} 
            </DndProvider>
      </div>
      <Button onClick={() => setOpen(!open)} className="btn-primary float-right hover:text-white mr-8">
        Add Product
      </Button>
      {open && 
         <DialogModal onClose={onClose} initial={open} onAdd={onProductAdd}/>  
      }
    </div>
  );
};

export default Products;