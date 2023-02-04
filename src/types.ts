export enum CATEGORIES {
    CONSOLE = "video game console",
    GAME = "video game"
}

export type TUserDB = {
    id: string,
    name: string,
    email: string,
    password: string
}

export type TProductsDB = {
    id: string,
    name: string,
    price: number,
    description: string,
    category: CATEGORIES,    
    image_url: string
}

export type TPurchasesDB = {
    id: string,
    buyer_id: string,
    total_price: number,
    delivered_at: string,
    created_at: string
    paid: number,
}

export type TPurchasesProductsDB = {
    purchase_id: string,
    product_id: string,
    quantity: number
}

export type TPurchasesWithProductsDB = {
    id: string,
    total_price: number,
    paid: number,
    delivered_at: string,
    buyer_id: string,
    created_at: string,
    name: string,
    price: number,
    category: CATEGORIES,
    description: string,
    image_url: string,
    productsOutput: TProductsDB[]
}