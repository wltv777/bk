'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { anonymousName } from '@/lib/utils';
import { Trophy, Heart, MessageSquare, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { CommunityPost } from '@/types';

export default function CommunityPage() {
  const { profile, gamification } = useUserStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);

  useEffect(() => {
    getDocs(
      query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'), limit(20))
    ).then((snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CommunityPost[]);
    });
  }, []);

  async function submitPost() {
    if (!newPost.trim() || !auth.currentUser) return;
    setPosting(true);
    const uid = auth.currentUser.uid;
    try {
      const post = {
        userId: uid,
        anonymousName: anonymousName(uid),
        content: newPost.trim(),
        likes: 0,
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'community_posts'), post);
      setPosts((prev) => [{ ...post, id: ref.id, createdAt: new Date() as any }, ...prev]);
      setNewPost('');
      toast.success('Publicado! 🔥');
    } catch {
      toast.error('Erro ao publicar.');
    } finally {
      setPosting(false);
    }
  }

  async function likePost(postId: string) {
    if (liked.includes(postId)) return;
    setLiked((prev) => [...prev, postId]);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    await updateDoc(doc(db, 'community_posts', postId), { likes: increment(1) });
  }

  const myRank = gamification.weeklyRank;

  return (
    <div className="min-h-screen bg-black">
      <div className="px-5 pt-12 pb-4">
        <h1 className="section-title text-3xl mb-1">Comunidade</h1>
        <p className="text-white/40 text-sm">Anônimo, real, motivacional</p>
      </div>

      <div className="px-5 space-y-4 pb-6">
        {/* My rank */}
        {myRank && (
          <div className="card-highlight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <div className="text-primary font-bold">Top {myRank}% esta semana</div>
              <div className="text-white/40 text-xs">Continue assim para subir no ranking</div>
            </div>
          </div>
        )}

        {/* Post input */}
        <div className="card space-y-2">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`Compartilhe como ${anonymousName(auth.currentUser?.uid ?? 'x')}...`}
            rows={2}
            className="input resize-none text-sm"
            maxLength={200}
          />
          <div className="flex items-center justify-between">
            <span className="text-white/20 text-xs">{newPost.length}/200</span>
            <button
              onClick={submitPost}
              disabled={!newPost.trim() || posting}
              className={cn('btn-primary py-2 px-4 text-sm flex items-center gap-1', (!newPost.trim() || posting) && 'opacity-40')}
            >
              <Send className="w-3.5 h-3.5" /> Publicar
            </button>
          </div>
        </div>

        {/* Feed */}
        {posts.map((post) => (
          <div key={post.id} className="card space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {post.anonymousName.charAt(0)}
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{post.anonymousName}</div>
                <div className="text-white/20 text-[10px]">
                  {post.createdAt instanceof Date
                    ? post.createdAt.toLocaleDateString('pt-BR')
                    : new Date((post.createdAt as any)?.seconds * 1000).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{post.content}</p>
            <div className="flex gap-3">
              <button
                onClick={() => likePost(post.id)}
                className={cn('flex items-center gap-1 text-xs transition-colors', liked.includes(post.id) ? 'text-danger' : 'text-white/30 hover:text-danger')}
              >
                <Heart className={cn('w-4 h-4', liked.includes(post.id) && 'fill-current')} />
                {post.likes}
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-white/40 text-sm">Seja o primeiro a publicar!</p>
          </div>
        )}
      </div>
    </div>
  );
}
