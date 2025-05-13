import { Button } from "@/components/ui/button";
import { Command , CommandInput, CommandItem } from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { Product } from "@/models/model";
import { useCallback, useEffect, useState } from "react";
import debounce from 'lodash.debounce'; 
import InfiniteScroll from "react-infinite-scroll-component";
import { Input } from "@/components/ui/input";
import { ShoppingCart } from "lucide-react";

export type dialogProps = {
    initial : boolean ,
    onAdd : (data : any) => void
}

export default function DialogModal({ initial , onAdd }: dialogProps) {

    const [open, setOpen] = useState(initial);
    const [page, setPage] = useState<number>(0);
    const [searchValue, setSearchValue] = useState<string>('');
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);  

    useEffect(() => {
        setOpen(initial);
        setAvailableProducts([]);     
        getProducts("", page); 
    }, [initial]);

    async function getProducts(search: string = "", page = 0, limit = 10) {
        const response = await fetch(`https://stageapi.monkcommerce.app/task/products/search?search=${search}&page=${page}&limit=${limit}`, {
            headers: {
                "x-api-key": "72njgfa948d9aS7gs5"
            }
        });
        const data = await response.json();
        if (data) {
            setAvailableProducts(prev => {
                if(search.trim().length > 0){
                    return [...data];
                }   
                return [...prev, ...data];
            });
        }

    }

    const onSelectProduct = ({target : {checked}}  : React.ChangeEvent<HTMLInputElement>,   index : number) =>{  
        const data = availableProducts[index]; 
        setSelectedProducts(prev =>{ 
            let concat = prev;
            if(checked){
               concat.push(data);
            } 
            else{
                concat = concat.filter(x => x.id != data.id);
            } 
            return [...concat];
        });
    }

    const onVariantSelect = ({target : {checked}} : React.ChangeEvent<HTMLInputElement>, parentIndex:number , id : number) =>{
        const data = availableProducts[parentIndex];  

        if(data){
            const variants = data.variants.map(x =>{
                if(x.id === id){
                    x.selected = checked;
                }
                return x;
            })
            data.variants = variants;
        }

        setSelectedProducts(prev =>{  
            return prev.map(x => {
                if(x.id === data.id){
                    x = data;
                }
                return x
            });
        });
    };

    const addProduct = () => { 
        onAdd(selectedProducts);
        setOpen(!open);
    };

    const handleSearch = useCallback(
        debounce((query: string) => { 
            getProducts(query);
        }, 200),
        [availableProducts]
    );

    const handleScroll = useCallback(
        debounce(() => { 
            setPage(prev =>{ 
                setSearchValue("");
                getProducts("", prev + 1);
                return  prev + 1;
            }); 
        }, 1000),
    [availableProducts]);

    useEffect(() => {
        handleSearch(searchValue);
    }, [searchValue]);



    return (
        <>
            <Dialog modal={true} open={open} onOpenChange={() => setOpen(!open)}>
                <DialogContent className="max-w-[45rem]">
                    <DialogHeader>
                        <DialogTitle>Select a Product</DialogTitle>
                    </DialogHeader>

                    <Command shouldFilter={false} onVolumeChange={() => setSearchValue("")}>
                        
                        <CommandInput  value={searchValue} onValueChange={setSearchValue} placeholder="Search products..." />

                        <section id="scrollableDiv" className="h-96 overflow-auto mt-2">
                            <InfiniteScroll
                                dataLength={availableProducts.length}
                                next={handleScroll}
                                hasMore={true}
                                loader={<div className="text-center">loading ...</div>}
                                scrollableTarget="scrollableDiv"
                            >
                                {availableProducts.map((product, index) => (
                                    <section key={index}>
                                        <CommandItem className="border-b"
                                            key={product.id}
                                            value={product.title}>
                                            <Input onChange={(e) =>  onSelectProduct(e  , index)} id="title" type="checkbox" className="w-4"></Input>
                                            {product.image.src ?
                                             <img className="w-10 rounded-md border-none h-10 shadow-md" src={product.image.src} alt="not found ..." />
                                             : <ShoppingCart />}
                                            <label htmlFor="title">{product.title}</label>
                                        </CommandItem>
                                        <div className="mt-2 px-10">
                                            {product.variants &&
                                                <>
                                                    {product.variants.map(((variant) => (
                                                        <div key={variant.id} className="flex gap-2">
                                                            <Input onChange={(e) => onVariantSelect(e , index , variant.id )} id="title" type="checkbox" className="w-4"></Input>
                                                            <div className="flex gap-2 w-full p-2 justify-between items-center border-b" key={variant.id}>
                                                                <label htmlFor="title" className="text-sm flex-[2.5]">{variant.title}</label>
                                                                <div className="flex flex-1 justify-between">
                                                                    <label htmlFor="title" className="text-sm">{variant.inventory_quantity ?? 0} available</label>
                                                                    <label htmlFor="title" className="text-sm">${Math.floor(variant.price)}</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )))}
                                                </>
                                            }
                                        </div>
                                    </section>

                                ))}
                            </InfiniteScroll>
                        </section>

                    </Command>
                    <DialogFooter className="!justify-between"> 
                            <div className="flex-1">{selectedProducts.length} product selected</div>
                            <div className="flex gap-2">
                                <Button onClick={() => setOpen(!open)} className="bg-white  text-primary2 hover:text-white border border-primary">cancel</Button>
                                <Button onClick={addProduct} type="submit">Add</Button>
                            </div> 
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
} 