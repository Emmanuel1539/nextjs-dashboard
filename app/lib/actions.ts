'use server'

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'});

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer',
    }),
    amount: z.coerce 
    .number()
    .gt(0, { message: 'Amount must be greater than $0' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status',
    }),
    date: z.string(),
});

// Use zod to create the expected types for the form data
const CreateInvoice = FormSchema.omit({id: true, date: true});

// Use zod to update the expected types for the form data
const UpdateInvoice = FormSchema.omit({date: true, id: true});

// Create state type for the form action
export type State = {
    error?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string;
};

export async function createInvoice(prevState: State, formData: FormData) {

    // Validate the form data using zod
    const validateFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: Number(formData.get('amount')),
        status: formData.get('status'),
    });

    if (!validateFields.success) {
        return {
            error: validateFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    
    // Prepare data for insertion into the database
    const { customerId, amount, status } = validateFields.data;
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

export async function updateInvoice(prevState: State, formData: FormData): Promise<State> {
    const id = formData.get('id') as string;
    // Validate the form data using zod
    const validateFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: Number(formData.get('amount')),
        status: formData.get('status'),
    });

    if (!validateFields.success) {
        return {
            error: validateFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validateFields.data;
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

export async function authenticateUser(
    prevState: string | undefined, 
    formData: FormData,
    ) {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        await signIn('credentials', {
        redirectTo: '/dashboard',
        email,
        password,
        });
       
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid email or password.';
                default:
                    return  'Authentication failed.' ;
            }
        }
        throw error; // Re-throw if it's not an AuthError
    }
}