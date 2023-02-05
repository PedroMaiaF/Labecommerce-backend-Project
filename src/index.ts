import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserDB, TProductsDB, TPurchasesDB, TPurchasesProductsDB, TPurchasesWithProductsDB } from './types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!" })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// GET USERS
app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined
        console.log(searchTerm)

        if (searchTerm === undefined) {
            const result = await db("users")
            res.status(200).send(result)
        } else {
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
// POST user
app.post("/users", async (req: Request, res: Response) => {
    try {
        const { id, name, email, password } = req.body

        if (typeof id !== "string") {
            res.status(400)
            throw new Error("'id' deve ser string")
        }

        if (id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")
        }

        if (typeof name !== "string") {
            res.status(400)
            throw new Error("'name' deve ser string")
        }

        if (name.length < 2) {
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 2 caracteres")
        }

        if (typeof email !== "string") {
            res.status(400)
            throw new Error("'email' deve ser string")
        }

        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
            throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
        }

        const [productsIdAlreadyExists]: TUserDB[] | undefined[] = await db("users").where({ id })

        if (productsIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' já existe")
        }

        const [userEmailAlreadyExists]: TUserDB[] | undefined[] = await db("users").where({ email })

        if (userEmailAlreadyExists) {
            res.status(400)
            throw new Error("'email' já existe")
        }

        const newUserCreate: TUserDB = {
            id,
            name,
            email,
            password
        }
        await db("users").insert(newUserCreate)

        res.status(201).send({
            message: "usuário criado com sucesso",
            user: newUserCreate
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// PUT USER
app.put('/users/:id', async (req: Request, res: Response) => {
    try {

        const idToEdit = req.params.id

        const newId = req.body.id
        const newName = req.body.name
        const newEmail = req.body.email
        const newPassword = req.body.password

        if (newId !== undefined) {
            if (newId[0] !== "U") {
                res.status(400)
                throw new Error("'id' deve começar com a letra 'U'.")
            }
            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }
            if (newId.length < 4) {
                res.status(400)
                throw new Error("'id' deve possuir pelo menos 4 caracteres.")
            }
        }
        if (newName !== undefined) {

            if (typeof newName !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }
            if (newName.length < 3) {
                res.status(400)
                throw new Error("'id' deve possuir pelo menos 3 caracteres.")
            }
        }


        if (newEmail !== undefined) {
            if (typeof newEmail !== "string") {
                res.status(400)
                throw new Error("'email' deve ser string")
            }
            if (newEmail.length < 4) {
                res.status(400)
                throw new Error("'email' deve possuir pelo menos 4 caracteres.")
            }
            if (!newEmail.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)) {
                throw new Error("'email' deve ser de um domínio válido")
            }
        }

        if (newPassword !== undefined) {
            if (typeof newPassword !== "string") {
                res.status(400)
                throw new Error("'password' deve ser string")
            }
            if (!newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
                throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
            }
        }

        const [user]: TUserDB[] | undefined = await db("users").where({ id: idToEdit })

        if (!user) {
            res.status(404)
            throw new Error("'id' de user não encontrado.")
        }

        const userToEdit: TUserDB = {
            id: newId || user.id,
            name: newName || user.name,
            email: newEmail || user.email,
            password: newPassword || user.password
        }

        await db("users").update(userToEdit).where({ id: idToEdit })

        res.status(201).send({
            message: "User editada com sucesso.",
            user: idToEdit
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// GET users pelo id dele
app.get('/users/:id/purchases', async (req: Request, res: Response) => {
    try {
        const buyerId = req.params.id

        const result: TPurchasesDB[] = await db("purchases")
            .select(
                "id",
                "buyer_id AS buyerId",
                "total_price AS totalPrice",
                "paid AS isPaid",
                "delivered_at AS deliveredAt",
                "created_at AS createdAt"
            )
            .where({ buyer_id: buyerId })

        if (!result) {
            res.status(404)
            throw new Error("O usuário informado não possui compras efetuadas.")
        }

        res.status(200).send(result)
        console.log("Array de compras do user informado.")

    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(error.message)
    }
})


// DEL user pelo id
app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "U") {
            throw new Error("'id' deve iniciar com a letra 'U'")
        }
        const userIdAlreadyExists: TUserDB[] | undefined[] = await db("users").where({ id: idToDelete })

        if (!userIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' não encontrado")
        }
        await db("purchases").del().where({ buyer_id: idToDelete })
        await db("users").del().where({ id: idToDelete })
        
        res.status(200).send({ message: "User deletado com sucesso" })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// Products
app.get("/products", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined
        console.log(searchTerm)

        if (searchTerm === undefined) {
            const result = await db("products")
                .select("id", "name", "price", "category", "description", "image_url AS image_url")
            res.status(200).send(result)
        } else {
            const result = await db("products")
                .select("id", "name", "price", "category", "description", "image_url AS image_url")
                .where("name", "LIKE", `%${searchTerm}%`)
                .orWhere("description", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// GET produto pelo id dele.
app.get('/products/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string

        const result = await db("products").where({ id })

        if (!result) {
            throw new Error("Produto não existe.")
        }
        res.status(200).send(result)
        console.log("Produto encontrado")

    } catch (error: any) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// POST products
app.post("/products", async (req: Request, res: Response) => {
    try {
        const { id, name, price, description, category, image_url } = req.body

        if (typeof id !== "string") {
            res.status(400)
            throw new Error("'id' deve ser string")
        }

        if (id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")
        }

        if (typeof name !== "string") {
            res.status(400)
            throw new Error("'name' deve ser string")
        }

        if (name.length < 4) {
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 4 caracteres")
        }

        if (!price) {
            res.status(404)
            throw new Error("'price' precisa ser informado.")
        }

        if (typeof price !== "number") {
            res.status(400)
            throw new Error("'price' deve ser passado como number.")
        }

        if (!category) {
            res.status(404)
            throw new Error("'category' precisa ser informada.")
        }

        if (typeof category !== "string") {
            res.status(400)
            throw new Error("'category' deve ser string.")
        }

        if (typeof description !== "string") {
            res.status(400)
            throw new Error("'Description' deve ser string")
        }

        const [productsIdAlreadyExists]: TProductsDB[] | undefined[] = await db("products").where({ id })

        if (productsIdAlreadyExists) {
            res.status(400)
            throw new Error("'id' do produto já existe")
        }
        const newProductCreate = {
            id,
            name,
            price,
            description,
            category,
            image_url: image_url
        }

        await db("products").insert(newProductCreate)

        const [insertedProduct] = await db("products").where({ id })

        res.status(201).send({
            message: "produto criado com sucesso",
            task: insertedProduct
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// PUT Product
app.put("/products/:id", async (req: Request, res: Response) => {
    try {
        const idToEdit = req.params.id

        const newId = req.body.id
        const newName = req.body.name
        const newPrice = req.body.price
        const newDescription = req.body.description
        const newCategory = req.body.category
        const newImageUrl = req.body.image_url

        if (newId !== undefined) {
            if (typeof newId !== "string") {
                res.status(400)
                throw new Error("'id' deve ser string")
            }

            if (newId.length < 4) {
                res.status(400)
                throw new Error("'id' deve possuir pelo menos 4 caracteres")
            }

        }

        if (newName !== undefined) {
            if (typeof newName !== "string") {
                res.status(400)
                throw new Error("'title' deve ser string")
            }

            if (newName.length < 4) {
                res.status(400)
                throw new Error("'title' deve possuir pelo menos 4 caracteres")
            }
        }

        if (newPrice !== undefined) {
            res.status(404)
        }
        if (typeof newPrice !== "number") {
            res.status(400)
            throw new Error("'price' deve ser passado como number.")
        }

        if (newDescription !== undefined) {
            if (typeof newDescription !== "string") {
                res.status(400)
                throw new Error("'Description' deve ser string")
            }
        }

        if (newCategory !== undefined) {
            if (typeof newCategory !== "string") {
                res.status(400)
                throw new Error("'Category' deve ser string")
            }
        }

        if (newImageUrl !== undefined) {
            if (typeof newImageUrl !== "number") {
                res.status(400)
                throw new Error("'Image_url' deve ser string")
            }
        }

        const [productToEdit]: TProductsDB[] | undefined[] = await db("products").where({ id: idToEdit })

        if (!productToEdit) {
            res.status(404)
            throw new Error("'id' não encontrado")
        }
        const newProductCreate: TProductsDB = {
            id: newId || productToEdit.id,
            name: newName || productToEdit.name,
            price: newPrice || productToEdit.price,
            description: newDescription || productToEdit.description,
            category: newCategory || productToEdit.category,
            image_url: newImageUrl || productToEdit.image_url
        }

        await db("products").update(newProductCreate).where({ id: idToEdit })

        res.status(200).send({
            message: "produto editado com sucesso",
            produto: newProductCreate
        })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// DEL Products
app.delete("/products/:id", async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "G" && idToDelete[0] !== "C") {
            res.status(400)
            throw new Error("'id' deve iniciar com a letra 'C' de 'Console' ou 'G' de 'Games'")
        }

        const [productIdToDelete]: TProductsDB[] | undefined[] = await db("products").where({ id: idToDelete })

        if (!productIdToDelete) {
            res.status(404)
            throw new Error("'id' não encontrado")
        }
        
        await db("purchases_products").del().where({ product_id: idToDelete })   
        await db("products").del().where({ id: idToDelete })

        res.status(200).send({ message: "produto deletado com sucesso" })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// GET Purchases 
app.get('/purchases', async (req: Request, res: Response) => {
    try {

        const searchTerm = req.query.q as string | undefined

        if (searchTerm === undefined) {
            const result = await db("purchases")
            .select(
                "purchases.id AS purchaseId",
                "purchases.total_price AS totalPrice",
                "purchases.created_at AS createdAt",
                "purchases.delivered_at AS deliveredAt",
                "purchases.paid AS isPaid",
            )
            res.status(200).send(result)
        } else {
            const result = await db("purchases")
            .select(
                "purchases.id AS purchaseId",
                "purchases.total_price AS totalPrice",
                "purchases.created_at AS createdAt",
                "purchases.paid AS isPaid",
            )
                .where("id", "LIKE", `%${searchTerm}%`)
                .orWhere("buyer_id", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)
        }
    } catch (error: any) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// GET purchases pelo id
app.get('/purchases/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        if (id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres.");
        }

        const purchase: TPurchasesDB[] | undefined[] = await db("purchases").where({ id: id })

        if (purchase) {
            const [cart] = await db("purchases")
                .select(
                    "purchases.id AS purchaseId",
                    "users.id AS buyerId",
                    "users.name AS buyerName",
                    "users.email AS buyerEmail",
                    "purchases.total_price AS totalPrice",
                    "purchases.created_at AS createdAt",
                    "purchases.paid AS isPaid",
                )
                .innerJoin("users", "purchases.buyer_id", "=", "users.id")
                .where({ "purchases.id": id })

            const purchaseProducts: TPurchasesProductsDB[] = await db("purchases_products")
                .select(
                    "purchases_products.product_id AS productId",
                    "products.name",
                    "products.price",
                    "products.description",
                    "products.image_url AS imageUrl",
                    "purchases_products.quantity"
                )
                .innerJoin("products", "products.id", "=", "purchases_products.product_id")
                .where({ purchase_id: id })

            const result = {
                ...cart,
                productsList: purchaseProducts
            }

            console.log(result)
            res.status(200).send(result)

        } else {
            res.status(404)
            throw new Error("Compra não encontrada no seu banco de dados.")
        }
    } catch (error: any) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/purchases", async (req: Request, res: Response) => {

    try {

        const newIdPurchase = req.body.purchaseId
        const newBuyer = req.body.buyerId
        const newProducts = req.body.products

        const {productId, quantity} = newProducts

        const [ purchaseIdAlreadyExists ] = await db("purchases").where({id: newIdPurchase})

        if(purchaseIdAlreadyExists){
            res.status(400)
            throw new Error("Id já cadastrado")
        }

        if(newIdPurchase[0] !== "P" && newIdPurchase[1] !== "U"){
            res.status(400)
            throw new Error("O id deve iniciar com 'PU'")
        }

        if (!newIdPurchase || !newBuyer|| !newProducts) {
            res.status(400)
            throw new Error("Falta adicionar o 'id', 'buyer' e 'produto(s)'")
        }

        if (typeof newIdPurchase !== "string" && typeof newBuyer !== "string") {
            res.status(400)
            throw new Error("'usersId' e 'productsId' são string")
        }

        let newTotalPrice = 0

        const newPurchase = {
            id: newIdPurchase,
            buyer_id: newBuyer,
            total_price: newTotalPrice
        }

        await db("purchases").insert(newPurchase)

        const products = []

        for(let product of newProducts){
            const [ addProduct ]  = await db("products")
            .select(
                "id",
                "name",
                "price",
                "description",
                "category",
                "image_url AS imageUrl"
                 )
            .where({ id: product.id})
            newTotalPrice += addProduct.price * product.quantity
            console.log(newTotalPrice)
            console.log(addProduct.price)
            await db("purchases_products").insert({purchase_id: newIdPurchase , product_id: product.id, quantity: product.quantity})
            const completeProduct = {
                ...addProduct,
                quantity
            }
            products.push(completeProduct)
        }

        await db("purchases").update({ total_price: newTotalPrice }).where({ id: newIdPurchase })

        const result = {
            id: newPurchase.id,
            buyer: newPurchase.buyer_id,
            totalPrice: newTotalPrice,
            products
        }

        res.status(201).send({ 
            message: "Pedido efetuado com sucesso",
            purchase: result
        })

    } catch (error: any) {
        console.log(error)
        if (res.statusCode === 200) {
            res.status(500)
        }
        res.send(error.message)
    }
})

// DEL purchases pelo id

app.delete("/purchases/:id", async (req: Request, res: Response) => {
    try {

        const idToDelete = req.params.id

        
        if(idToDelete[0] !== "P" && idToDelete[1] !== "U") {
            res.status(400)
            throw new Error("'id' deve começar com a letra 'PU'")            
        }

        const [ purchaseIdExists ]: TPurchasesDB[] | undefined = await db("purchases").where({ id: idToDelete })
        
        if(!purchaseIdExists) {
            res.status(404)
            throw new Error("'id' da compra não encontrado")            
        }
        
        await db("purchases_products").del().where({ purchase_id: idToDelete })
        await db("purchases").del().where({ id: idToDelete })

        res.status(200).send({ message: "Pedido cancelado" })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})