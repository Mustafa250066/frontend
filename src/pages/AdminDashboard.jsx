import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance, API } from '../App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, LogOut, Key, Home } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [shows, setShows] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showDialog, setShowDialog] = useState(false);
  const [seasonDialog, setSeasonDialog] = useState(false);
  const [episodeDialog, setEpisodeDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  
  // Edit states
  const [editingShow, setEditingShow] = useState(null);
  const [editingSeason, setEditingSeason] = useState(null);
  const [editingEpisode, setEditingEpisode] = useState(null);

  // Forms
  const [showForm, setShowForm] = useState({ name: '', description: '', poster_url: '' });
  const [seasonForm, setSeasonForm] = useState({ show_id: '', season_number: '', name: '' });
  const [episodeForm, setEpisodeForm] = useState({
    show_id: '',
    season_id: '',
    episode_number: '',
    title: '',
    description: '',
    video_url: '',
    duration: '',
    thumbnail_url: '',
  });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      await axiosInstance.get('/auth/verify');
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('adminToken');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginForm);
      localStorage.setItem('adminToken', response.data.access_token);
      setIsAuthenticated(true);
      toast.success('Login successful');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  const fetchAllData = async () => {
    try {
      const [showsRes, seasonsRes, episodesRes] = await Promise.all([
        axios.get(`${API}/shows`),
        axios.get(`${API}/seasons`),
        axios.get(`${API}/episodes`),
      ]);
      setShows(showsRes.data);
      setSeasons(seasonsRes.data);
      setEpisodes(episodesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  // Show Operations
  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      if (editingShow) {
        await axiosInstance.put(`/shows/${editingShow.id}`, showForm);
        toast.success('Show updated successfully');
      } else {
        await axiosInstance.post('/shows', showForm);
        toast.success('Show created successfully');
      }
      setShowDialog(false);
      setShowForm({ name: '', description: '', poster_url: '' });
      setEditingShow(null);
      fetchAllData();
    } catch (error) {
      toast.error(editingShow ? 'Failed to update show' : 'Failed to create show');
    }
  };

  const handleEditShow = (show) => {
    setEditingShow(show);
    setShowForm({
      name: show.name || '',
      description: show.description || '',
      poster_url: show.poster_url || '',
    });
    setShowDialog(true);
  };

  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Are you sure? This will delete all seasons and episodes.')) return;
    try {
      await axiosInstance.delete(`/shows/${showId}`);
      toast.success('Show deleted successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete show');
    }
  };

  // Season Operations
  const handleCreateSeason = async (e) => {
    e.preventDefault();
    try {
      const seasonData = {
        ...seasonForm,
        season_number: parseInt(seasonForm.season_number),
      };
      if (editingSeason) {
        await axiosInstance.put(`/seasons/${editingSeason.id}`, seasonData);
        toast.success('Season updated successfully');
      } else {
        await axiosInstance.post('/seasons', seasonData);
        toast.success('Season created successfully');
      }
      setSeasonDialog(false);
      setSeasonForm({ show_id: '', season_number: '', name: '' });
      setEditingSeason(null);
      fetchAllData();
    } catch (error) {
      toast.error(editingSeason ? 'Failed to update season' : 'Failed to create season');
    }
  };

  const handleEditSeason = (season) => {
    setEditingSeason(season);
    setSeasonForm({
      show_id: season.show_id || '',
      season_number: season.season_number?.toString() || '',
      name: season.name || '',
    });
    setSeasonDialog(true);
  };

  const handleDeleteSeason = async (seasonId) => {
    if (!window.confirm('Are you sure? This will delete all episodes.')) return;
    try {
      await axiosInstance.delete(`/seasons/${seasonId}`);
      toast.success('Season deleted successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete season');
    }
  };

  // Episode Operations
  const handleCreateEpisode = async (e) => {
    e.preventDefault();
    try {
      const episodeData = {
        ...episodeForm,
        episode_number: parseInt(episodeForm.episode_number),
        duration: episodeForm.duration ? parseInt(episodeForm.duration) : null,
      };
      if (editingEpisode) {
        await axiosInstance.put(`/episodes/${editingEpisode.id}`, episodeData);
        toast.success('Episode updated successfully');
      } else {
        await axiosInstance.post('/episodes', episodeData);
        toast.success('Episode created successfully');
      }
      setEpisodeDialog(false);
      setEpisodeForm({
        show_id: '',
        season_id: '',
        episode_number: '',
        title: '',
        description: '',
        video_url: '',
        duration: '',
        thumbnail_url: '',
      });
      setEditingEpisode(null);
      fetchAllData();
    } catch (error) {
      toast.error(editingEpisode ? 'Failed to update episode' : 'Failed to create episode');
    }
  };

  const handleEditEpisode = (episode) => {
    setEditingEpisode(episode);
    setEpisodeForm({
      show_id: episode.show_id || '',
      season_id: episode.season_id || '',
      episode_number: episode.episode_number?.toString() || '',
      title: episode.title || '',
      description: episode.description || '',
      video_url: episode.video_url || '',
      duration: episode.duration?.toString() || '',
      thumbnail_url: episode.thumbnail_url || '',
    });
    setEpisodeDialog(true);
  };

  const handleDeleteEpisode = async (episodeId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axiosInstance.delete(`/episodes/${episodeId}`);
      toast.success('Episode deleted successfully');
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete episode');
    }
  };

  // Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/auth/change-password', passwordForm);
      toast.success('Password changed successfully');
      setPasswordDialog(false);
      setPasswordForm({ current_password: '', new_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };

  // Filter seasons by show
  const getSeasonsByShow = (showId) => {
    return seasons.filter((s) => s.show_id === showId);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#e50914] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Admin Login
            </h1>
            <p className="text-gray-400">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="bg-[#1a1a1a] p-8 rounded-lg border border-gray-800">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  data-testid="login-username"
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  data-testid="login-password"
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              data-testid="login-submit-btn"
              type="submit"
              className="w-full mt-6 bg-[#e50914] hover:bg-[#f40612]"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <Button
              data-testid="back-home-btn"
              type="button"
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full mt-2"
            >
              Back to Home
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#e50914]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Button
              data-testid="home-btn"
              onClick={() => navigate('/')}
              variant="outline"
              className="border-gray-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              data-testid="change-password-btn"
              onClick={() => setPasswordDialog(true)}
              variant="outline"
              className="border-gray-700"
            >
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button
              data-testid="logout-btn"
              onClick={handleLogout}
              variant="outline"
              className="border-gray-700 text-red-500 hover:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="shows" className="w-full">
          <TabsList className="bg-[#1a1a1a] border border-gray-800">
            <TabsTrigger value="shows">Shows</TabsTrigger>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
          </TabsList>

          {/* Shows Tab */}
          <TabsContent value="shows" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Shows</h2>
              <Dialog open={showDialog} onOpenChange={(open) => {
                setShowDialog(open);
                if (!open) {
                  setEditingShow(null);
                  setShowForm({ name: '', description: '', poster_url: '' });
                }
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="add-show-btn" className="bg-[#e50914] hover:bg-[#f40612]">
                    <Plus className="mr-2" /> Add Show
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a1a] border-gray-800">
                  <DialogHeader>
                    <DialogTitle>{editingShow ? 'Edit Show' : 'Add New Show'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateShow} className="space-y-4">
                    <div>
                      <Label>Show Name *</Label>
                      <Input
                        data-testid="show-name-input"
                        value={showForm.name}
                        onChange={(e) => setShowForm({ ...showForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        data-testid="show-description-input"
                        value={showForm.description}
                        onChange={(e) => setShowForm({ ...showForm, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Poster URL</Label>
                      <Input
                        data-testid="show-poster-input"
                        value={showForm.poster_url}
                        onChange={(e) => setShowForm({ ...showForm, poster_url: e.target.value })}
                      />
                    </div>
                    <Button data-testid="create-show-btn" type="submit" className="w-full bg-[#e50914] hover:bg-[#f40612]">
                      {editingShow ? 'Update Show' : 'Create Show'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shows.map((show) => (
                <div key={show.id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                  {show.poster_url && (
                    <img src={show.poster_url} alt={show.name} className="w-full h-48 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{show.name}</h3>
                  {show.description && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{show.description}</p>}
                  <div className="flex gap-2">
                    <Button
                      data-testid={`edit-show-${show.id}`}
                      onClick={() => handleEditShow(show)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      data-testid={`delete-show-${show.id}`}
                      onClick={() => handleDeleteShow(show.id)}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Seasons Tab */}
          <TabsContent value="seasons" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Seasons</h2>
              <Dialog open={seasonDialog} onOpenChange={(open) => {
                setSeasonDialog(open);
                if (!open) {
                  setEditingSeason(null);
                  setSeasonForm({ show_id: '', season_number: '', name: '' });
                }
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="add-season-btn" className="bg-[#e50914] hover:bg-[#f40612]">
                    <Plus className="mr-2" /> Add Season
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a1a] border-gray-800">
                  <DialogHeader>
                    <DialogTitle>{editingSeason ? 'Edit Season' : 'Add New Season'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSeason} className="space-y-4">
                    <div>
                      <Label>Select Show *</Label>
                      <Select
                        value={seasonForm.show_id}
                        onValueChange={(value) => setSeasonForm({ ...seasonForm, show_id: value })}
                        required
                      >
                        <SelectTrigger data-testid="season-show-select">
                          <SelectValue placeholder="Select a show" />
                        </SelectTrigger>
                        <SelectContent>
                          {shows.map((show) => (
                            <SelectItem key={show.id} value={show.id}>
                              {show.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Season Number *</Label>
                      <Input
                        data-testid="season-number-input"
                        type="number"
                        value={seasonForm.season_number}
                        onChange={(e) => setSeasonForm({ ...seasonForm, season_number: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Season Name (Optional)</Label>
                      <Input
                        data-testid="season-name-input"
                        value={seasonForm.name}
                        onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
                      />
                    </div>
                    <Button data-testid="create-season-btn" type="submit" className="w-full bg-[#e50914] hover:bg-[#f40612]">
                      {editingSeason ? 'Update Season' : 'Create Season'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {shows.map((show) => {
                const showSeasons = getSeasonsByShow(show.id);
                if (showSeasons.length === 0) return null;
                return (
                  <div key={show.id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-4">{show.name}</h3>
                    <div className="space-y-2">
                      {showSeasons.map((season) => (
                        <div key={season.id} className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded">
                          <span>
                            Season {season.season_number}
                            {season.name && ` - ${season.name}`}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              data-testid={`edit-season-${season.id}`}
                              onClick={() => handleEditSeason(season)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              data-testid={`delete-season-${season.id}`}
                              onClick={() => handleDeleteSeason(season.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Episodes Tab */}
          <TabsContent value="episodes" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Episodes</h2>
              <Dialog open={episodeDialog} onOpenChange={(open) => {
                setEpisodeDialog(open);
                if (!open) {
                  setEditingEpisode(null);
                  setEpisodeForm({
                    show_id: '',
                    season_id: '',
                    episode_number: '',
                    title: '',
                    description: '',
                    video_url: '',
                    duration: '',
                    thumbnail_url: '',
                  });
                }
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="add-episode-btn" className="bg-[#e50914] hover:bg-[#f40612]">
                    <Plus className="mr-2" /> Add Episode
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a1a] border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEpisode ? 'Edit Episode' : 'Add New Episode'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEpisode} className="space-y-4">
                    <div>
                      <Label>Select Show *</Label>
                      <Select
                        value={episodeForm.show_id}
                        onValueChange={(value) => setEpisodeForm({ ...episodeForm, show_id: value, season_id: '' })}
                        required
                      >
                        <SelectTrigger data-testid="episode-show-select">
                          <SelectValue placeholder="Select a show" />
                        </SelectTrigger>
                        <SelectContent>
                          {shows.map((show) => (
                            <SelectItem key={show.id} value={show.id}>
                              {show.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Select Season *</Label>
                      <Select
                        value={episodeForm.season_id}
                        onValueChange={(value) => setEpisodeForm({ ...episodeForm, season_id: value })}
                        required
                        disabled={!episodeForm.show_id}
                      >
                        <SelectTrigger data-testid="episode-season-select">
                          <SelectValue placeholder="Select a season" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSeasonsByShow(episodeForm.show_id).map((season) => (
                            <SelectItem key={season.id} value={season.id}>
                              Season {season.season_number}
                              {season.name && ` - ${season.name}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Episode Number *</Label>
                      <Input
                        data-testid="episode-number-input"
                        type="number"
                        value={episodeForm.episode_number}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Episode Title (Optional)</Label>
                      <Input
                        data-testid="episode-title-input"
                        value={episodeForm.title}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Video URL * (Google Drive, YouTube, or any video URL)</Label>
                      <Input
                        data-testid="episode-video-url-input"
                        value={episodeForm.video_url}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, video_url: e.target.value })}
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        data-testid="episode-description-input"
                        value={episodeForm.description}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Duration (seconds)</Label>
                      <Input
                        data-testid="episode-duration-input"
                        type="number"
                        value={episodeForm.duration}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, duration: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Thumbnail URL</Label>
                      <Input
                        data-testid="episode-thumbnail-input"
                        value={episodeForm.thumbnail_url}
                        onChange={(e) => setEpisodeForm({ ...episodeForm, thumbnail_url: e.target.value })}
                      />
                    </div>
                    <Button data-testid="create-episode-btn" type="submit" className="w-full bg-[#e50914] hover:bg-[#f40612]">
                      {editingEpisode ? 'Update Episode' : 'Create Episode'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {episodes.map((episode) => {
                const show = shows.find((s) => s.id === episode.show_id);
                const season = seasons.find((s) => s.id === episode.season_id);
                return (
                  <div key={episode.id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">
                          {show?.name} - Season {season?.season_number}
                        </p>
                        <h3 className="text-lg font-semibold mb-2">
                          Episode {episode.episode_number}{episode.title ? `: ${episode.title}` : ''}
                        </h3>
                        {episode.description && (
                          <p className="text-sm text-gray-400 mb-2">{episode.description}</p>
                        )}
                        <p className="text-sm text-gray-500 truncate">URL: {episode.video_url}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          data-testid={`edit-episode-${episode.id}`}
                          onClick={() => handleEditEpisode(episode)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          data-testid={`delete-episode-${episode.id}`}
                          onClick={() => handleDeleteEpisode(episode.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="bg-[#1a1a1a] border-gray-800">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                data-testid="current-password-input"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                data-testid="new-password-input"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
              />
            </div>
            <Button data-testid="change-password-submit-btn" type="submit" className="w-full bg-[#e50914] hover:bg-[#f40612]">
              Change Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;