import { Button } from "@/components/ui/button";
import { Command , CommandItem } from "@/components/ui/command";
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
import { Search, ShoppingCart } from "lucide-react";
import { fetchProducts } from "@/service/productService";  
export type dialogProps = {
    initial : boolean , 
    onAdd : (data : any) => void
    onEdit : (id : number , data : any) => void
    onClose : (v:boolean) => void
}
 

export default function DialogModal({ initial , onClose  , onAdd}: dialogProps) {

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

    useEffect(() =>{
        onClose(open);
    }, [open])

    async function getProducts(search: string = "", page = 0, limit = 10) {

        const data = await fetchProducts(search , page , limit);
        if (data) {
            setAvailableProducts(prev => {
                if(search.trim().length > 0){
                    return [...data];
                }   
                return [...prev, ...data];
            });
        }
        else{
            setAvailableProducts([]);
        } 

    }

    const onSelectProduct = ({target : {checked}}  : React.ChangeEvent<HTMLInputElement>,   index : number) =>{  
        const data : Product = availableProducts[index]; 
        data.selected = checked;
        setSelectedProducts(prev =>{ 
            let concat = prev;
            data.variants.forEach(x => x.selected = checked);  
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
                return x;
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
                <DialogContent className="max-w-[45rem] border-b p-0 gap-0">

                    <DialogHeader className="px-4 py-3">
                        <DialogTitle>Select a Product</DialogTitle>
                    </DialogHeader>

                    <Command className="px-0 py-2" shouldFilter={false} onVolumeChange={() => setSearchValue("")}> 
                        <div className="px-4 relative"> 
                            <Input className="pl-8" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}  placeholder="Search product..."></Input>
                            <Search className="absolute left-5 top-2 w-5 h-5" />
                        </div> 
 
                        <section id="scrollableDiv" className="h-96 overflow-auto mt-2">
                            <InfiniteScroll
                                dataLength={availableProducts.length}
                                next={handleScroll}
                                hasMore={availableProducts.length != 0}
                                loader={<div className="text-center mt-4">Loading ...</div>}
                                scrollableTarget="scrollableDiv"
                                endMessage={<div className="text-center mt-4"> No products found </div>}
                            >
                                {availableProducts.map((product, index) => (
                                    <section key={index}>
                                        <CommandItem className="px-5 border-b"
                                            key={product.id}
                                            value={product.title}>  
                                            <Input onChange={(e) => onSelectProduct(e  , index)} checked={product.selected} id={`product ${product.id}`} type="checkbox" className="w-4 accent-[#008060] "></Input>
                                            {product.image.src ?
                                             <img className="w-10 rounded-md border-none h-10 shadow-md" src={product.image.src} alt="not found ..." />
                                             : <ShoppingCart />}
                                            <label htmlFor={`product ${product.id}`}>{product.title}</label>
                                        </CommandItem>
                                        <div className="">
                                            {product.variants &&
                                                <>
                                                    {product.variants.map(((variant) => (
                                                        <div key={variant.id} className="flex gap-2 px-14 border-b hover:bg-gray-50">
                                                            <Input onChange={(e) => onVariantSelect(e , index , variant.id )} checked={variant.selected} id={`variant ${variant.id}`} type="checkbox" className="w-4 accent-[#008060]"></Input>
                                                            <div className="flex gap-2 w-full p-2 justify-between items-center " key={variant.id}>
                                                                <label htmlFor={`variant ${variant.id}`} className="text-sm flex-[2.5]">{variant.title}</label>
                                                                <div className="flex flex-1 justify-between">
                                                                    <label htmlFor={`variant ${variant.id}`} className="text-sm">{variant.inventory_quantity ?? 0} available</label>
                                                                    <label htmlFor={`variant ${variant.id}`} className="text-sm">${Math.floor(variant.price)}</label>
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

                    <DialogFooter className="!justify-between p-4"> 
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