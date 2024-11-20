'use client'
import { useRouter } from "next/navigation";
import { useState } from "react"
import { BASE_URI } from "./api/constant";
import Link from "next/link";

export default function Login() {
    const [formData, setFormData] = useState({ name: '', password: '' });
    const [error, setError] = useState('');
    const [message, setmessage] = useState('');
    const router = useRouter();

    const handlChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setmessage('');
        try {
            const res = await fetch(`${BASE_URI}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'failed to  login')
            }
            if(res.status === 404){
                const data = await res.json();
                setError(data.message)
            }
            const data = await res.json();
            const token = data.token;
            localStorage.setItem("logToken", token);
            const userId = data.userId;
            localStorage.setItem("loguserId", userId);
            setmessage("Login successfully!")
            setTimeout(() => {
                router.push('/blog');
            }, 1000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || 'An error accured')
            } else {
                setError('An unexpected error accured')
            }
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg">
                <h2 className="text-2xl font-bold text-center text-blue-600">Login</h2>
                {message && (<p className="text-green-500 text-sm text-center">{message}</p>)}
                {error && (<p className="text-red-500 text-sm text-center">{error}</p>)}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handlChange}
                            required
                            className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="text"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handlChange}
                            required
                            className="w-full px-4 py-2 mt-1 text-gray-700 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Login
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Dont have an account ? {' '}
                    <Link href="/signup" className="text-blue-600 hover:underline"> Register</Link>
                </p>
            </div>
        </div>
    )
}