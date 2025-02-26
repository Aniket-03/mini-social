export interface PostModal {
  id: string; 
    createdAt?: string;  
    userId?: string; 
    username?: string; 
    imageURL?: string;  
    likes?: string[];  
    savedBy?: string[];  
  }
  
export  interface Comment {
    id?: string;
    text: string;
    userId: string;
    username?: string;
    parentId?: string | null;
    createdAt: any;
    replies?: Comment[];
  }