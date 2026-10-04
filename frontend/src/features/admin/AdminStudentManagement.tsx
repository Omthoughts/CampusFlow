import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../lib/api';
import { Plus, Users, User, Mail, Hash, BookOpen, GraduationCap, Building2, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';

const studentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  studentId: z.string().min(1, 'Student ID is required'),
  departmentId: z.string().optional(),
  course: z.string().optional(),
  year: z.enum(['FY', 'SY']).optional(),
  division: z.enum(['A', 'B']).optional(),
  rollNumber: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentResponse {
  id: string;
  name: string;
  email: string;
  studentId: string;
  course: string | null;
  year: string | null;
  division: string | null;
  rollNumber: string | null;
  status: string;
  department: { name: string; code: string } | null;
}

export default function AdminStudentManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<{ studentId: string, email: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: students, isLoading, error } = useQuery({
    queryKey: ['admin', 'students'],
    queryFn: async () => {
      const res = await api.get('/admin/students');
      return res.data.data as StudentResponse[];
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema)
  });

  const createMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const res = await api.post('/admin/students', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
      setSuccessData({ studentId: data.studentId, email: data.email });
      reset();
    }
  });

  const onSubmit = (data: StudentFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Student Management
          </h1>
          <p className="text-slate-500 mt-1">Manage student accounts and credentials.</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setSuccessData(null);
            createMutation.reset();
          }}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Student
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{(error as any)?.response?.data?.error?.message || 'Failed to load students'}</p>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-medium">
              <tr>
                <th className="px-6 py-4">Name & Email</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Course / Dept</th>
                <th className="px-6 py-4">Year / Div</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading students...</td>
                </tr>
              ) : students?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No students found.</td>
                </tr>
              ) : (
                students?.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{student.studentId || '-'}</td>
                    <td className="px-6 py-4">
                      <div>{student.course || '-'}</div>
                      <div className="text-xs text-slate-500">{student.department?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {student.year ? `${student.year} - ${student.division || '-'}` : '-'}
                      {student.rollNumber && <div className="text-xs text-slate-500">Roll: {student.rollNumber}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Create Student Account
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {successData ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Student Account Created!</h3>
                  <p className="text-slate-600 mb-6">
                    The student has been successfully saved to the database and can now log in.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-6 max-w-sm mx-auto text-left border border-slate-200">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Student ID</p>
                        <p className="font-mono text-slate-900">{successData.studentId}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Login ID (Email)</p>
                        <p className="font-medium text-slate-900">{successData.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSuccessData(null);
                      setIsModalOpen(false);
                    }}
                    className="mt-8 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {createMutation.isError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-100">
                      {(createMutation.error as any)?.response?.data?.error?.message || 'Failed to create student.'}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-slate-400" /> Full Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        {...register('name')} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Omkar Mankar"
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <Hash className="h-4 w-4 text-slate-400" /> Student ID <span className="text-red-500">*</span>
                      </label>
                      <input 
                        {...register('studentId')} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="MCA2026001"
                      />
                      {errors.studentId && <p className="text-xs text-red-500">{errors.studentId.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-slate-400" /> College Email (Login ID) <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email"
                        {...register('email')} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="student@moderncoe.edu.in"
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-slate-400" /> Password <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="password"
                        {...register('password')} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Minimum 8 characters"
                      />
                      {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-slate-400" /> Course / Program
                      </label>
                      <input 
                        {...register('course')} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="MCA"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-slate-400" /> Academic Year
                      </label>
                      <select 
                        {...register('year')} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      >
                        <option value="">Select Year</option>
                        <option value="FY">First Year (FY)</option>
                        <option value="SY">Second Year (SY)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Division</label>
                      <select 
                        {...register('division')} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      >
                        <option value="">Select Division</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Roll Number</label>
                      <input 
                        {...register('rollNumber')} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="e.g. 42"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
