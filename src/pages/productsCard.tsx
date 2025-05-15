import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select' 
import type { Identifier, XYCoord } from 'dnd-core'
import { GripVertical, Pencil, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react' 
import { useDrag, useDrop } from 'react-dnd'
import type { addProduct } from './products'

export const ItemTypes = {
  CARD: 'card',
} 

const style = { 
  padding: '0.5rem 1rem', 
  backgroundColor: 'white',
  cursor: 'move',
}

export type CardProps  = Partial<addProduct> & {
  id: any 
  index: number,
  type : "VARIANT" | "PRODUCT"
  moveCard: (dragIndex: number, hoverIndex: number) => void
  removeProduct: (hoverIndex: number) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

function ProductCard({ index, id, title : tValue , discount : discountValue , price , type , discountType : discountTypeValue,  moveCard  ,
   isSmall , removeProduct , onEdit , showDiscount , onChange} : CardProps | any) {
 

  const [isShow , setShow] = useState(showDiscount ?? false); 
  const [title , setTitle] = useState(tValue); 
  const [discount , setDiscount] = useState(discountValue ?? price); 
  const [discountType , setDiscountType] = useState(discountTypeValue ?? "Flat Off"); 


  useEffect(() =>{
      // only for variant
      if(isSmall){
        onChange(id , {
          title : title , discount : discount , discountType: discountType
        })
      }
  }, [title , discount , discountType]);

  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top 

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex) 
      item.index = hoverIndex;
      
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: type,
    item: () => {
      return { id, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref));

  return (
    <div ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
        <div className="flex items-center space-x-4 p-2 outline-none rounded-md"> 
              <GripVertical className='stroke-gray-400 ' /> 
              <span className="text-sm">{index + 1}.</span>
              <div className='relative'>
                <Input
                  name='title'
                  value={title}  
                  onChange={(e) => setTitle(e.target.value)}
                  className={`primary-inp ${isSmall?  '!w-32' : 'w-56'} pr-6 truncate placeholder:truncate placeholder:text-gray-500`}
                />
                <div className=' cursor-pointer  absolute right-2 top-2'>
                  <Pencil onClick={() => onEdit(true)}  className='w-4 h-4 stroke-gray-400'/>
                </div>
              </div>


              {(!isShow && !isSmall) ?
                  <Button className='flex-1' onClick={() => setShow(true)}>Add discount</Button> : 
                  <>
                    <Input
                      value={discount} 
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-24 primary-inp"
                    />
                    <Select
                      value={discountType}
                      onValueChange={(e) => setDiscountType(e)} 
                    >
                    <SelectTrigger className="w-32 border-tr z-40">
                        <SelectValue placeholder="Discount Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="% Off">% Off</SelectItem>
                        <SelectItem value="Flat Off">Flat Off</SelectItem>
                      </SelectContent>
                    </Select> 
                  </>
              } 


              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeProduct(id ?? 0)}
              >
                <X className="h-4 w-4" />
              </Button>
        </div>
    </div>
  )
}


export default ProductCard;