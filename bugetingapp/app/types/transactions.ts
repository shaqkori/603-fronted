export type Transaction = {
    id: number;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: "income" | "expense";

};
