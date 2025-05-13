import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripVertical } from 'lucide-react';
import { getEmptyImage } from 'react-dnd-html5-backend';

interface Item {
  id: string;
  name: string;
}

interface ItemCardProps {
  item: Item;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  isDragging: boolean;
  draggedIndex: number | null;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
  name: string;
}

const CustomDragLayer: React.FC = () => {
  const { item, itemType, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!isDragging || itemType !== 'ITEM' || !currentOffset) {
    return null;
  }

  const { name, index } = item as { name: string; index: number };

  return (
    <div
      className="fixed pointer-events-none z-50 flex items-center space-x-2 p-2 border rounded-md bg-white shadow-lg scale-95 rotate-2 transition-all duration-200 ease-out animate-pulse"
      style={{
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
        transitionProperty: 'transform',
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth, natural easing
      }}
    >
      <GripVertical className="cursor-move" />
      <span className="text-sm">{index + 1}.</span>
      <span>{name}</span>
    </div>
  );
};

const ItemCard: React.FC<ItemCardProps> = ({ item, index, moveItem, isDragging: isDraggingGlobal, draggedIndex }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'ITEM',
    item: { id: item.id, index, name: item.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const [, drop] = useDrop({
    accept: 'ITEM',
    hover(item: DragItem, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({ top: rect.top, left: rect.left });
    }
  }, [index, isDraggingGlobal]);

  drag(drop(ref));

  const isPlaceholder = isDraggingGlobal && draggedIndex === index;

  return (
    <div
      ref={ref}
      className={`flex items-center space-x-2 p-2 border rounded-md transition-all duration-300 ease-in-out relative ${
        isPlaceholder
          ? 'opacity-20 bg-gray-100 border-dashed transition-all duration-500'
          : 'hover:shadow-md'
      } ${isDragging ? 'opacity-0' : 'opacity-100'}`}
      style={{
        transform: isDraggingGlobal && !isPlaceholder ? `cam` : undefined,
        transitionProperty: 'transform, opacity', 
      }}
    >
      <GripVertical className="cursor-move" />
      <span className="text-sm">{index + 1}.</span>
      <span>{item.name}</span>
    </div>
  );
};

const SmoothLiveDndList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
    { id: '4', name: 'Item 4' },
    { id: '5', name: 'Item 5' },
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const newItems = [...items];
    const temp = newItems[dragIndex];
    newItems[dragIndex] = newItems[hoverIndex];
    newItems[hoverIndex] = temp;
    setItems(newItems);
    setDraggedIndex(hoverIndex);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Smooth Live Drag and Drop List</h2>
        <div className="space-y-2">
          {items.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              moveItem={moveItem}
              isDragging={draggedIndex !== null}
              draggedIndex={draggedIndex}
            />
          ))}
        </div>
        <CustomDragLayer />
      </div>
    </DndProvider>
  );
};

export default SmoothLiveDndList;