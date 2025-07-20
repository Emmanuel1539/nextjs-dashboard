'use server'

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'});

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.number().min(0),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

// Use zod to create the expected types for the form data
const CreateInvoice = FormSchema.omit({id: true, date: true});

// Use zod to update the expected types for the form data
const UpdateInvoice = FormSchema.omit({date: true, id: true});

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: Number(formData.get('amount')),
        status: formData.get('status'),
    });
    const amountInCents = Math.round(amount * 100);
    const date = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD

    // Save the invoice to the database or perform any other necessary actions
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`

    // Revalidate paths or perform any other necessary actions after creating the invoice
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: Number(formData.get('amount')),
        status: formData.get('status'),
    });
    const amountInCents = Math.round(amount * 100);

    // Update the invoice in the database
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}`;

    // Revalidate paths or perform any other necessary actions after updating the invoice
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice( id: string ) {
    // Delete the invoice from the database
    await sql`DELETE FROM invoices WHERE id = ${id}`;

    // Revalidate paths or perform any other necessary actions after deleting the invoice
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}