import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, ThumbsUp, Trash2, Plus, 
  ChevronLeft, Search, Filter, ShieldAlert, Award, 
  Clock, Share2, Send, CornerDownRight
} from 'lucide-react';
import API from '../api';

const categories = [
  { id: 'all', label: 'All Discussions', desc: 'Browse all posts', color: '#BEF264' },
  { id: 'hospital_update', label: '🏥 Hospital Announcements & Discounts', desc: 'Updates from registered hospitals', color: '#38BDF8' },
  { id: 'insurance_offer', label: '🛡️ Insurance Policies & Offers', desc: 'Announcements from insurance partners', color: '#FBBF24' },
  { id: 'patient_support', label: '🆘 Patient Support & Helpdesk', desc: 'Issues, questions, and support requests', color: '#F87171' },
  { id: 'experience', label: '💬 Healthcare Experiences', desc: 'Share your personal health journey', color: '#34D399' }
];

export default function ForumPage({ navigate, user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtering & Sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('new'); // 'new' or 'hot'
  const [searchQuery, setSearchQuery] = useState('');

  // Detailed View & Comment state
  const [activePost, setActivePost] = useState(null); // Single post details
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', content: '', category: 'experience' });
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/api/forum/posts', getHeaders());
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch forum posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleVote = async (postId, currentVote, targetVote) => {
    if (!user) {
      alert('Please log in to vote on posts.');
      return;
    }

    // Toggle vote logic: if clicking already active vote, clear it (0), else set it
    const voteValue = currentVote === targetVote ? 0 : targetVote;

    // Optimistically update UI
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === postId) {
        const scoreDiff = voteValue - currentVote;
        return {
          ...p,
          score: p.score + scoreDiff,
          user_vote: voteValue
        };
      }
      return p;
    }));

    if (activePost && activePost.id === postId) {
      setActivePost(prev => ({
        ...prev,
        score: prev.score + (voteValue - currentVote),
        user_vote: voteValue
      }));
    }

    try {
      await API.post(`/api/forum/posts/${postId}/vote`, { vote_value: voteValue }, getHeaders());
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      fetchPosts();
    }
  };

  const handleOpenPost = async (postId) => {
    setPostLoading(true);
    setError('');
    try {
      const res = await API.get(`/api/forum/posts/${postId}`, getHeaders());
      setActivePost(res.data.post);
      setComments(res.data.comments);
    } catch (err) {
      console.error(err);
      setError('Failed to load post details.');
    } finally {
      setPostLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.content.trim()) {
      setCreateError('Title and content cannot be empty.');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      await API.post('/api/forum/posts', createForm, getHeaders());
      setShowCreateModal(false);
      setCreateForm({ title: '', content: '', category: 'experience' });
      fetchPosts();
    } catch (err) {
      console.error(err);
      setCreateError(err.response?.data?.error || 'Failed to publish post.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeletePost = async (postId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await API.delete(`/api/forum/posts/${postId}`, getHeaders());
      if (activePost && activePost.id === postId) {
        setActivePost(null);
      }
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete post.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await API.post(`/api/forum/posts/${activePost.id}/comments`, { content: newComment }, getHeaders());
      setNewComment('');
      // Reload comments
      handleOpenPost(activePost.id);
      // Update comment count in posts list
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === activePost.id) {
          return { ...p, comment_count: p.comment_count + 1 };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to add comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await API.delete(`/api/forum/comments/${commentId}`, getHeaders());
      setComments(prev => prev.filter(c => c.id !== commentId));
      // Update comment count in posts list
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === activePost.id) {
          return { ...p, comment_count: Math.max(0, p.comment_count - 1) };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to delete comment.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Get color for category badges
  const getCategoryColor = (catId) => {
    return categories.find(c => c.id === catId)?.color || '#94A3B8';
  };

  const getCategoryLabel = (catId) => {
    const label = categories.find(c => c.id === catId)?.label || 'General';
    return label.replace(/^[^\w]*/, '').trim(); // Remove prefix emojis for badge text
  };

  // Filter and sort posts
  const filteredPosts = posts
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => {
      const matchText = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(matchText) || 
             p.content.toLowerCase().includes(matchText) ||
             p.author_name.toLowerCase().includes(matchText);
    })
    .sort((a, b) => {
      if (sortBy === 'hot') {
        return b.score - a.score;
      }
      return b.id - a.id;
    });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#022C22', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .forum-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          outline: none;
          width: 100%;
          transition: border-color 0.2s;
        }
        .forum-input:focus {
          border-color: #BEF264;
        }
        .post-card {
          transition: transform 0.2s, background-color 0.2s;
        }
        .post-card:hover {
          background: rgba(255, 255, 255, 0.05);
          cursor: pointer;
        }
        .sidebar-item {
          transition: background-color 0.2s, color 0.2s;
          cursor: pointer;
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .like-button {
          transition: all 0.2s ease-in-out;
        }
        .like-button:hover {
          background: rgba(190, 242, 100, 0.15) !important;
          transform: scale(1.1);
        }
        .like-button:active {
          transform: scale(0.9);
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#022C22', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('home')}>
          <img src="/logo.png" alt="UIU HealthCare" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>UIU HealthCare</span>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', gap: '4px', borderRadius: '40px' }}>
          <button onClick={() => navigate('home')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', cursor: 'pointer' }}>Home</button>
          <button onClick={() => navigate('about')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', cursor: 'pointer' }}>About Us</button>
          <button onClick={() => navigate('hospitals')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', cursor: 'pointer' }}>Hospitals</button>
          <button onClick={() => navigate('doctors')} style={{ background: 'transparent', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', cursor: 'pointer' }}>Doctors</button>
          <button onClick={() => navigate('forum')} style={{ background: 'rgba(255,255,255,0.15)', color: '#BEF264', border: 'none', padding: '6px 16px', borderRadius: '30px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>Forum</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#BEF264', textTransform: 'capitalize' }}>{user.role}</div>
              </div>
              <button onClick={() => {
                const role = user.role;
                if (role === 'patient') navigate('patient-dashboard');
                else if (role === 'doctor') navigate('doctor-dashboard');
                else if (role === 'hospital') navigate('hospital-dashboard');
                else if (role === 'insurance') navigate('insurance-dashboard');
                else navigate('admin-dashboard');
              }} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                Dashboard
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('login')} style={{ background: '#BEF264', color: '#064E3B', padding: '8px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* MAIN VIEW */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px', display: 'grid', gridTemplateColumns: activePost ? '1fr' : '280px 1fr', gap: '40px', width: '100%', flex: 1 }}>
        
        {/* FORUM LIST VIEW */}
        {!activePost && (
          <>
            {/* Sidebar Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Create Post Button */}
              {user ? (
                <button onClick={() => setShowCreateModal(true)} style={{ width: '100%', background: '#BEF264', color: '#064E3B', padding: '16px', borderRadius: '16px', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(190,242,100,0.15)' }}>
                  <Plus size={18} /> Share Experience
                </button>
              ) : (
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <ShieldAlert size={28} style={{ color: '#FBBF24', margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>Log in to share experience, ask questions, or vote.</div>
                  <button onClick={() => navigate('login')} style={{ background: '#BEF264', color: '#064E3B', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', width: '100%' }}>
                    Sign In
                  </button>
                </div>
              )}

              {/* Categories Navigation */}
              <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</div>
                {categories.map(cat => (
                  <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="sidebar-item"
                    style={{ 
                      padding: '12px', 
                      borderRadius: '12px', 
                      background: selectedCategory === cat.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                      borderLeft: selectedCategory === cat.id ? `3px solid ${cat.color}` : '3px solid transparent'
                    }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: selectedCategory === cat.id ? 700 : 500, color: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.7)' }}>
                      {cat.id === 'all' ? 'All Discussions' : getCategoryLabel(cat.id)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Toolbar */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                  <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                  <input className="forum-input" style={{ paddingLeft: 46 }} placeholder="Search discussion..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>

                {/* Sort */}
                <div className="glass-card" style={{ display: 'flex', padding: '4px', borderRadius: '12px' }}>
                  <button onClick={() => setSortBy('new')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: sortBy === 'new' ? 'rgba(255,255,255,0.1)' : 'transparent', color: sortBy === 'new' ? 'white' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    Newest
                  </button>
                  <button onClick={() => setSortBy('hot')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: sortBy === 'hot' ? 'rgba(255,255,255,0.1)' : 'transparent', color: sortBy === 'hot' ? 'white' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    Most Liked
                  </button>
                </div>
              </div>

              {/* Status messages */}
              {loading && <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>Loading discussions...</div>}
              {error && <div style={{ textAlign: 'center', padding: '20px', color: '#FCA5A5' }}>{error}</div>}
              
              {!loading && filteredPosts.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
                  No discussions found matching your filter. Be the first to share!
                </div>
              )}

              {/* Post List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredPosts.map(post => {
                  const catColor = getCategoryColor(post.category);
                  const isAuthor = user && user.id === post.user_id;
                  const isAdmin = user && user.role === 'admin';

                  return (
                    <div key={post.id} className="glass-card post-card" onClick={() => handleOpenPost(post.id)}
                      style={{ padding: '24px', display: 'flex', gap: '24px' }}>
                      
                      {/* Like Control */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '40px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleVote(post.id, post.user_vote, 1)}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            cursor: 'pointer', 
                            color: post.user_vote === 1 ? '#BEF264' : 'rgba(255,255,255,0.4)', 
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%'
                          }}
                          className="like-button"
                          title={post.user_vote === 1 ? "Unlike" : "Like"}
                        >
                          <ThumbsUp size={22} fill={post.user_vote === 1 ? '#BEF264' : 'transparent'} />
                        </button>
                      </div>

                      {/* Content Area */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, background: `${catColor}20`, color: catColor }}>
                            {getCategoryLabel(post.category)}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {formatDate(post.created_at)}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '8px', lineHeight: 1.3 }}>
                          {post.title}
                        </h3>

                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {post.content}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                              {post.author_name.charAt(0)}
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{post.author_name}</span>
                            <span style={{ fontSize: '0.7rem', color: '#BEF264', background: 'rgba(190,242,100,0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>{post.author_role}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                              <MessageSquare size={16} />
                              <span>{post.comment_count} comments</span>
                            </div>

                            {(isAuthor || isAdmin) && (
                              <button onClick={(e) => handleDeletePost(post.id, e)} style={{ background: 'transparent', border: 'none', color: '#FCA5A5', cursor: 'pointer', padding: 4 }}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* FORUM DETAIL VIEW */}
        {activePost && (
          <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
            <button onClick={() => { setActivePost(null); fetchPosts(); }} 
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '24px', fontWeight: 600, fontSize: '0.9rem' }}>
              <ChevronLeft size={16} /> Back to Discussions
            </button>

            {postLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>Loading post details...</div>
            ) : (
              <>
                {/* Main Post Card */}
                <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', display: 'flex', gap: '24px' }}>
                  {/* Like Control */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                    <button onClick={() => handleVote(activePost.id, activePost.user_vote, 1)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: activePost.user_vote === 1 ? '#BEF264' : 'rgba(255,255,255,0.4)', 
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%'
                      }}
                      className="like-button"
                      title={activePost.user_vote === 1 ? "Unlike" : "Like"}
                    >
                      <ThumbsUp size={24} fill={activePost.user_vote === 1 ? '#BEF264' : 'transparent'} />
                    </button>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, background: `${getCategoryColor(activePost.category)}20`, color: getCategoryColor(activePost.category) }}>
                        {getCategoryLabel(activePost.category)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {formatDate(activePost.created_at)}
                      </span>
                    </div>

                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '20px', lineHeight: 1.3 }}>
                      {activePost.title}
                    </h1>

                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                      {activePost.content}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
                          {activePost.author_name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{activePost.author_name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#BEF264', textTransform: 'capitalize' }}>{activePost.author_role}</div>
                        </div>
                      </div>

                      {(user && (user.id === activePost.user_id || user.role === 'admin')) && (
                        <button onClick={() => handleDeletePost(activePost.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#F87171', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <Trash2 size={14} /> Delete Discussion
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comment Section */}
                <div className="glass-card" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '24px' }}>
                    Comments ({comments.length})
                  </h3>

                  {/* Add Comment */}
                  {user ? (
                    <form onSubmit={handleAddComment} style={{ marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, flexShrink: 0 }}>
                        {user.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <textarea className="forum-input" rows={3} placeholder="Add to the discussion..." value={newComment} onChange={e => setNewComment(e.target.value)} style={{ resize: 'vertical' }} />
                        <button type="submit" style={{ alignSelf: 'flex-end', background: '#BEF264', color: '#064E3B', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Send size={14} /> Comment
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', marginBottom: '32px', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                      Please <button onClick={() => navigate('login')} style={{ background: 'none', border: 'none', color: '#BEF264', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign In</button> to post comments.
                    </div>
                  )}

                  {/* Comments list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {comments.map(comment => {
                      const isCommentAuthor = user && user.id === comment.user_id;
                      const isCommentAdmin = user && user.role === 'admin';

                      return (
                        <div key={comment.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>
                            {comment.author_name.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{comment.author_name}</span>
                                <span style={{ fontSize: '0.7rem', color: '#BEF264', background: 'rgba(190,242,100,0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>{comment.author_role}</span>
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>• {formatDate(comment.created_at)}</span>
                              </div>

                              {(isCommentAuthor || isCommentAdmin) && (
                                <button onClick={() => handleDeleteComment(comment.id)} style={{ background: 'transparent', border: 'none', color: '#FCA5A5', cursor: 'pointer', padding: 4 }}>
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {comments.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                        No comments yet. Share your thoughts!
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Share Your Experience</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '24px' }}>Your announcement, feedback or story will be visible to the community.</p>

            {createError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: '16px', color: '#FCA5A5', fontSize: '0.85rem' }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Category</label>
                <select className="forum-input" value={createForm.category} 
                  onChange={e => setCreateForm(f => ({ ...f, category: e.target.value }))}
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer' }}>
                  {categories.slice(1).map(cat => {
                    // Restrict specific category posting to matching roles if needed, or allow all. 
                    // Let's check roles: 
                    // Hospital Update: best for Hospital role or Admin.
                    // Insurance Offer: best for Insurance role or Admin.
                    // Patient Support: best for Patient or Admin.
                    // Experience: anyone.
                    // But we can let everyone post anywhere, or display matching tag. Let's let them select.
                    return (
                      <option key={cat.id} value={cat.id} style={{ background: '#022C22', color: 'white' }}>
                        {cat.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Title</label>
                <input className="forum-input" placeholder="An interesting title" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>Content</label>
                <textarea className="forum-input" rows={6} placeholder="Provide details of your announcement, offer or feedback..." value={createForm.content} onChange={e => setCreateForm(f => ({ ...f, content: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={createLoading} style={{ background: '#BEF264', color: '#064E3B', padding: '10px 24px', borderRadius: '10px', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {createLoading ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#022C22', padding: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
        <div>UIU HealthCare Forum Ecosystem © 2026. Sharing experience for a healthier nation.</div>
      </footer>
    </div>
  );
}
