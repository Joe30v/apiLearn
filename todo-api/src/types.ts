 export interface User{
    id: number;
    username: string;
    password: string;
 }

 export interface Todo{
    id: number;
    userId: number;
    title: string;
    completed: boolean;
 }

 export interface RegisterRequest{
    username: string;
    password: string;
 }
 
 export interface LoginRequest{
    username: string;
    password: string;
 }

 
// Lets authMiddleware attach the logged-in user's id to the request,
// so every route below it can read req.userId.
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}
