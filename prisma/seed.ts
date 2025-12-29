import { PrismaClient, Prisma, RoleName, OrderStatus ,Category, Product } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function seed() {
    // 1) Roles (unique by name)
    await prisma.role.upsert({
        where: { name: RoleName.CUSTOMER },
        update: {},
        create: { name: RoleName.CUSTOMER },
    })

    await prisma.role.upsert({
        where: { name: RoleName.ADMIN },
        update: {},
        create: { name: RoleName.ADMIN },
    })

    const customerRole = await prisma.role.findUnique({
        where: { name: RoleName.CUSTOMER },
    })
    const adminRole = await prisma.role.findUnique({
        where: { name: RoleName.ADMIN },
    })

    if (!customerRole || !adminRole) {
        throw new Error("Roles were not created correctly.")
    }

    // 2) Users (unique by email)
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {
            roleId: adminRole.id,
        },
        create: {
            email: "admin@example.com",
            password: "admin123", // NOTE: hash in real apps
            roleId: adminRole.id,
        },
    })

    const customerUser = await prisma.user.upsert({
        where: { email: "customer@example.com" },
        update: {
            roleId: customerRole.id,
        },
        create: {
            email: "customer@example.com",
            password: "customer123", // NOTE: hash in real apps
            roleId: customerRole.id,
        },
    })

    // 3) Categories (your schema does NOT have @unique, so we do findFirst + create)
    // If you can, add `@unique` to Category.name and then use upsert like Role.
    const categoryNames = ["Electronics", "Books", "Clothing"]

    const categories: Category[] | null = []
    for (const name of categoryNames) {
        const existing = await prisma.category.findFirst({ where: { name } })
        const category =
            existing ??
            (await prisma.category.create({
                data: { name },
            }))
        categories.push(category)
    }

    // Handy refs
    const electronics = categories.find((c) => c.name === "Electronics")!
    const books = categories.find((c) => c.name === "Books")!

    // 4) Products (no @unique field, so we do findFirst by (name + categoryId))
    const productsData: Array<{
        name: string
        price: number
        stockQuantity: number
        categoryId: string
    }> = [
            { name: "Laptop", price: 1200, stockQuantity: 10, categoryId: electronics.id },
            { name: "Headphones", price: 80, stockQuantity: 50, categoryId: electronics.id },
            { name: "Novel", price: 15, stockQuantity: 100, categoryId: books.id },
        ]

    const products: Product[] = []
    for (const p of productsData) {
        const existing = await prisma.product.findFirst({
            where: { name: p.name, categoryId: p.categoryId },
        })

        const product =
            existing ??
            (await prisma.product.create({
                data: {
                    name: p.name,
                    price: p.price,
                    stockQuantity: p.stockQuantity,
                    categoryId: p.categoryId,
                },
            }))

        products.push(product)
    }

    const laptop = products.find((p) => p.name === "Laptop")!
    const headphones = products.find((p) => p.name === "Headphones")!

    // 5) Orders (no unique field; we can create a new order each run OR keep one stable order)
    // Here we keep one stable order by reusing "first order for that user + pending".
    const existingOrder = await prisma.order.findFirst({
        where: { userId: customerUser.id, status: OrderStatus.pending },
        include: { items: true },
    })

    const order =
        existingOrder ??
        (await prisma.order.create({
            data: {
                userId: customerUser.id,
                status: OrderStatus.pending,
                totalAmount: 0,
            },
        }))

    // 6) Order items
    // We'll ensure each product appears once in the order by checking existing items.
    const existingItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
        select: { productId: true },
    })
    const existingProductIds = new Set(existingItems.map((i) => i.productId))

    const itemsToEnsure = [
        { product: laptop, quantity: 1 },
        { product: headphones, quantity: 2 },
    ]

    for (const item of itemsToEnsure) {
        if (existingProductIds.has(item.product.id)) continue

        await prisma.orderItem.create({
            data: {
                orderId: order.id,
                productId: item.product.id,
                quantity: item.quantity,
                itemPrice: item.product.price, // snapshot price
            },
        })
    }

    // 7) Recalculate totalAmount
    const finalItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
    })

    const totalAmount = finalItems.reduce(
        (sum, i) => sum + i.itemPrice * i.quantity,
        0
    )

    await prisma.order.update({
        where: { id: order.id },
        data: { totalAmount },
    })

    console.log("✅ Seed completed successfully")
}

seed()
    .catch((e) => {
        console.error("❌ Seed failed:", e)
        process.exitCode = 1
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
