import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import instance from '@/api/axiosConfig';

interface EventData {
  id: string;
  title: string;
  date: string;
  description: string;
}

const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scaffolded Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await instance.get('/admin/events');
      const responseData = response.data?.data || response.data;
      const eventsArray = Array.isArray(responseData) 
        ? responseData 
        : Array.isArray(responseData?.data) 
          ? responseData.data 
          : [];
      setEvents(eventsArray);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      description: ''
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (event: EventData) => {
    setFormData({
      title: event.title,
      date: event.date.split('T')[0],
      description: event.description
    });
    setIsEditing(true);
    setCurrentId(event.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await instance.delete(`/admin/events/${id}`);
      toast({ title: "Success", description: "Event deleted successfully" });
      fetchEvents();
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEditing && currentId) {
        await instance.put(`/admin/events/${currentId}`, formData);
        toast({ title: "Success", description: "Event updated successfully" });
      } else {
        await instance.post('/admin/events', formData);
        toast({ title: "Success", description: "Event created successfully" });
      }
      resetForm();
      fetchEvents();
    } catch (err: any) {
      console.error(err);
      toast({ 
        title: "Error", 
        description: err.response?.data?.message || err.response?.data?.error || "Failed to save event", 
        variant: "destructive" 
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update event details.' : 'Add a new event to the system.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Summer Festival"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Details about the event..."
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
                {formLoading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Events</CardTitle>
          <CardDescription>Manage all scheduled events.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading events...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No events found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Title</th>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {event.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="truncate max-w-xs" title={event.description}>
                          {event.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          className="h-8 px-2"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
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

export default AdminEventsPage;
