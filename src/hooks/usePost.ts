// src/hooks/usePost.ts

import {useState,useCallback,useEffect} from "react";
import {postService} from "../services/postService";

import type {
    CmsPost,
    CmsPostCreate,
    CmsPostUpdate
} from "../models/interfaces/Post";

import type {PostQuery} from "../services/postService";

export const usePost = ()=>{

    const [posts,setPosts]=useState<CmsPost[]>([]);
    const [selectedPost,setSelectedPost]=useState<CmsPost|null>(null);

    const [pagination,setPagination]=useState({
        total:0,
        page:1,
        page_size:20,
        pages:1
    });

    const [loading,setLoading]=useState(false);
    const [error,setError]=useState<string|null>(null);

    const fetchPosts=useCallback(async(query?:PostQuery)=>{

        setLoading(true);

        try{

            const data=await postService.getAll(query);

            setPosts(data.items);

            setPagination({
                total:data.total,
                page:data.page,
                page_size:data.page_size,
                pages:data.pages
            });

            setError(null);

        }catch(err:any){

            setError(err.response?.data?.detail ?? "Failed loading posts");

        }finally{

            setLoading(false);

        }

    },[]);

    const fetchPost=useCallback(async(id:number)=>{

        setLoading(true);

        try{

            const post=await postService.getById(id);

            setSelectedPost(post);

        }finally{

            setLoading(false);

        }

    },[]);

    const createPost=useCallback(async(data:CmsPostCreate)=>{

        const created=await postService.create(data);

        setPosts(prev=>[created,...prev]);

        return created;

    },[]);

    const updatePost=useCallback(async(id:number,data:CmsPostUpdate)=>{

        const updated=await postService.update(id,data);

        setPosts(prev=>
            prev.map(p=>p.id===id?updated:p)
        );

        if(selectedPost?.id===id){
            setSelectedPost(updated);
        }

        return updated;

    },[selectedPost]);

    const deletePost=useCallback(async(id:number)=>{

        await postService.delete(id);

        setPosts(prev=>prev.filter(x=>x.id!==id));

    },[]);

    const publishPost=useCallback(async(id:number)=>{

        const updated=await postService.publish(id);

        setPosts(prev=>
            prev.map(p=>p.id===id?updated:p)
        );

        return updated;

    },[]);

    const archivePost=useCallback(async(id:number)=>{

        const updated=await postService.archive(id);

        setPosts(prev=>
            prev.map(p=>p.id===id?updated:p)
        );

        return updated;

    },[]);

    useEffect(()=>{
        fetchPosts();
    },[fetchPosts]);

    return{

        posts,
        selectedPost,
        pagination,
        loading,
        error,

        actions:{
            fetchPosts,
            fetchPost,
            createPost,
            updatePost,
            deletePost,
            publishPost,
            archivePost
        }

    };

};