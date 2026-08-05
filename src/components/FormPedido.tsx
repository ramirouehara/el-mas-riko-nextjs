"use client"

import type { Categoria, Producto } from "@/generated/prisma/client";
import { crearPedido } from "@/app/pedidos/actions";

type ProductoPlano = { id: number; nombre: string; precio: number; categoriaId: number };
type CategoriaConProductos = { id: number; nombre: string; productos: ProductoPlano[] };


export default function Form ({ categorias }: { categorias: CategoriaConProductos[] }) {
    return (
        <form action={crearPedido}>
            <input type="text" name="nombre" placeholder="Nombre"/>
            <input type="text" name="telefono" placeholder="Telefono"/>
            <input type="text" name="direccion" placeholder="Direccion"/>
            <select name="categoriaId">
                {categorias.map((c)=>(
                <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
            </select>
            <select name="productoId">
                {categorias.map((c)=>(
                    c.productos.map((p)=>(
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))
                ))}
            </select>
            <input type="number" name="cantidad"/>
            <button type="submit">Hacer Pedido!</button>

        </form>    

    )
};