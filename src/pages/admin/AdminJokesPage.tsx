import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import instance from '@/api/axiosConfig';

interface Joke {
  id: string;
  active_date: string;
  content: string;
  sponsor_name?: string;
  sponsor_logo_url?: string;
  sponsor_website_url?: string;
}

const AdminJokesPage: React.FC = () => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    active_date: '',
    content: '',
    sponsor_name: '',
    sponsor_logo_url: '',
    sponsor_website_url: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchJokes = async () => {
    try {
      setLoading(true);
      const response = await instance.get('/admin/jokes');
      const responseData = response.data?.data || response.data;
      const jokesArray = Array.isArray(responseData) 
        ? responseData 
        : Array.isArray(responseData?.data) 
          ? responseData.data 
          : [];
      setJokes(jokesArray);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch jokes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJokes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      active_date: '',
      content: '',
      sponsor_name: '',
      sponsor_logo_url: '',
      sponsor_website_url: ''
    });
    setIsEditing(false);
    setCurrentId(null);
    setFormError(null);
  };

  const handleEdit = (joke: Joke) => {
    setFormData({
      active_date: joke.active_date.split('T')[0], // format date for input type="date"
      content: joke.content,
      sponsor_name: joke.sponsor_name || '',
      sponsor_logo_url: joke.sponsor_logo_url || '',
      sponsor_website_url: joke.sponsor_website_url || ''
    });
    setIsEditing(true);
    setCurrentId(joke.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this joke?')) return;

    try {
      await instance.delete(`/admin/jokes/${id}`);
      toast({
        title: "Success",
        description: "Joke deleted successfully",
      });
      fetchJokes();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete joke",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (isEditing && currentId) {
        await instance.put(`/admin/jokes/${currentId}`, formData);
        toast({ title: "Success", description: "Joke updated successfully" });
      } else {
        await instance.post('/admin/jokes', formData);
        toast({ title: "Success", description: "Joke created successfully" });
      }
      resetForm();
      fetchJokes();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 400) {
        // Handle specific unique constraint error
        const errorMsg = err.response?.data?.message || err.response?.data?.error;
        if (errorMsg && errorMsg.toLowerCase().includes('already scheduled')) {
          setFormError('A joke is already scheduled for this active date. Please choose another date.');
        } else {
          setFormError(errorMsg || 'Failed to save joke. Please check your inputs.');
        }
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Joke of the Day</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Joke' : 'Schedule New Joke'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update the details of the selected joke.' : 'Schedule a joke for a specific date.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && (
            <Alert variant="destructive" className="mb-4 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="active_date">Active Date *</Label>
                <Input
                  id="active_date"
                  name="active_date"
                  type="date"
                  required
                  value={formData.active_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsor_name">Sponsor Name</Label>
                <Input
                  id="sponsor_name"
                  name="sponsor_name"
                  value={formData.sponsor_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsor_logo_url">Sponsor Logo URL</Label>
                <Input
                  id="sponsor_logo_url"
                  name="sponsor_logo_url"
                  type="url"
                  value={formData.sponsor_logo_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsor_website_url">Sponsor Website URL</Label>
                <Input
                  id="sponsor_website_url"
                  name="sponsor_website_url"
                  type="url"
                  value={formData.sponsor_website_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Joke Content *</Label>
              <Textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Why did the chicken cross the road?"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Saving...' : isEditing ? 'Update Joke' : 'Schedule Joke'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Jokes</CardTitle>
          <CardDescription>Manage all upcoming and past jokes.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading jokes...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : jokes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No jokes scheduled yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Active Date</th>
                    <th scope="col" className="px-6 py-3">Content</th>
                    <th scope="col" className="px-6 py-3">Sponsor Name</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jokes.map((joke) => (
                    <tr key={joke.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {new Date(joke.active_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-xs md:max-w-md" title={joke.content}>
                          {joke.content}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {joke.sponsor_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(joke)}
                          className="h-8 px-2"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(joke.id)}
                          className="h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJokesPage;
