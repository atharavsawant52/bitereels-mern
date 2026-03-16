import { useState, useEffect } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import api from '../api/client';

const CommentModal = ({ reelId, isOpen, onClose }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (!isOpen) return undefined;

        let isCancelled = false;

        (async () => {
            try {
                const response = await api.get(`/api/reels/${reelId}/comments`);
                if (!isCancelled && response.data.success) {
                    setComments(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching comments", error);
            }
        })();

        return () => {
            isCancelled = true;
        };
    }, [isOpen, reelId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const response = await api.post(`/api/reels/${reelId}/comments`, {
                text: newComment
            }, config);
            
            if (response.data.success) {
                setComments([...comments, response.data.data]);
                setNewComment('');
            }
        } catch (error) {
            console.error("Error posting comment", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 w-full max-w-md h-[70vh] rounded-xl flex flex-col relative border border-gray-800" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-xl">
                    <h3 className="text-white font-bold text-lg">Comments</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {comments.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">No comments yet. Be the first!</p>
                    ) : (
                        comments.map((comment, index) => (
                            <div key={index} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                                    {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-white font-bold text-sm">{comment.user?.username}</span>
                                        <span className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <form onSubmit={handlePostComment} className="p-4 border-t border-gray-800 bg-gray-900 rounded-b-xl flex gap-3 items-center">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-800 border-none rounded-full px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={!newComment.trim()}
                        className="text-primary disabled:text-gray-600 disabled:cursor-not-allowed hover:scale-110 transition p-2"
                    >
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommentModal;
