import React, { useState, useEffect } from 'react';
import { Course, Transaction, MerchantSettings, PaymentLink } from '../types';
import { formatCurrency } from '../utils';
import {
  fetchMerchantSettings,
  saveMerchantSettings,
  updateTransactionStatus,
  fetchPaymentLinks,
  savePaymentLinks
} from '../services/firebase';
import {
  PlusCircle,
  Trash2,
  Users,
  BookOpen,
  DollarSign,
  Edit,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  Smartphone,
  Share2,
  Globe,
  Link2
} from 'lucide-react';
import { Button } from './ui/Button';

interface SellerDashboardProps {
  courses: Course[];
  transactions: Transaction[];
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onLogout: () => void;
  onShareCourse: (id: string, title: string) => void;
  onPreviewWebsite: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  courses,
  transactions,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onLogout,
  onShareCourse,
  onPreviewWebsite
}) => {
  const [activeTab, setActiveTab] = useState<
    'courses' | 'approvals' | 'transactions' | 'settings'
  >('courses');

  const [selectedCourseOrders, setSelectedCourseOrders] = useState<string | null>(
    null
  );

  const [merchantSettings, setMerchantSettings] =
    useState<MerchantSettings>({
      name: '',
      upiId: '',
      merchantId: '',
      number: ''
    });

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [isSavingPaymentLinks, setIsSavingPaymentLinks] = useState(false);

  useEffect(() => {
    fetchMerchantSettings().then(settings => {
      if (settings) {
        setMerchantSettings(settings);
      }
    });

    fetchPaymentLinks().then(setPaymentLinks);
  }, []);

  // Calculate Stats
  const successTransactions = transactions.filter(
    t => t.status === 'success'
  );

  const pendingTransactions = transactions.filter(
    t => t.approvalStatus === 'pending'
  );

  const totalRevenue = successTransactions.reduce(
    (acc, t) => acc + t.amount,
    0
  );

  const totalStudents = courses.reduce(
    (acc, c) => acc + c.students,
    0
  );

  // Save Merchant Settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);

    await saveMerchantSettings(merchantSettings);

    alert('Merchant details updated successfully.');

    setIsSavingSettings(false);
  };

  // -----------------------------
  // Payment Links
  // -----------------------------

  const addPaymentLinkRow = () => {
    setPaymentLinks(prev => [
      ...prev,
      {
        id: `pl_${Date.now()}`,
        amount: 0,
        url: '',
        label: ''
      }
    ]);
  };

  const updatePaymentLinkRow = (
    id: string,
    field: keyof PaymentLink,
    value: string
  ) => {
    setPaymentLinks(prev =>
      prev.map(link => {
        if (link.id !== id) {
          return link;
        }

        if (field === 'amount') {
          return {
            ...link,
            amount: Number(value) || 0
          };
        }

        return {
          ...link,
          [field]: value
        };
      })
    );
  };

  const removePaymentLinkRow = (id: string) => {
    setPaymentLinks(prev =>
      prev.filter(link => link.id !== id)
    );
  };

  const handleSavePaymentLinks = async () => {
    const invalid = paymentLinks.some(
      l => !l.url.trim() || l.amount <= 0
    );

    if (invalid) {
      alert(
        'Every payment link needs a valid amount (greater than 0) and a URL.'
      );
      return;
    }

    setIsSavingPaymentLinks(true);

    await savePaymentLinks(paymentLinks);

    alert('Payment links updated successfully.');

    setIsSavingPaymentLinks(false);
  };

  // -----------------------------
  // Approvals
  // -----------------------------

  const handleApproval = async (
    txn: Transaction,
    action: 'approved' | 'rejected'
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to ${action.toUpperCase()} this payment?`
      )
    ) {
      return;
    }

    try {
      await updateTransactionStatus(txn, action);

      alert(
        `Transaction ${action}. Refresh the page to see changes if not immediate.`
      );

      window.location.reload();
    } catch (e: any) {
      alert('Error updating status: ' + e.message);
    }
  };

  // -----------------------------
  // Course Orders
  // -----------------------------

  const getOrdersForCourse = (courseId: string) => {
    return transactions
      .filter(t => t.courseId === courseId)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  };

  const selectedCourseTitle = courses.find(
    c => c.id === selectedCourseOrders
  )?.title;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-gray-500">
              Monitor performance, manage courses, and track orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">

            <Button
              variant="secondary"
              onClick={onPreviewWebsite}
              className="border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
            >
              <Globe size={18} className="mr-2" />
              Website Preview
            </Button>

            <Button
              onClick={onAddCourse}
              className="flex-1 md:flex-none"
            >
              <PlusCircle size={18} className="mr-2" />
              Add New Course
            </Button>

            <Button
              variant="secondary"
              onClick={onLogout}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

          {/* Revenue */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 md:p-3 bg-green-100 text-green-600 rounded-lg">
                <DollarSign size={20} className="md:w-6 md:h-6" />
              </div>
            </div>

            <h3 className="text-gray-500 text-xs md:text-sm font-medium">
              Total Revenue
            </h3>

            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          {/* Pending */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 md:p-3 bg-amber-100 text-amber-600 rounded-lg">
                <Clock size={20} className="md:w-6 md:h-6" />
              </div>
            </div>

            <h3 className="text-gray-500 text-xs md:text-sm font-medium">
              Pending Approvals
            </h3>

            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {pendingTransactions.length}
            </p>

            {pendingTransactions.length > 0 && (
              <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>

          {/* Courses */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-lg">
                <BookOpen size={20} className="md:w-6 md:h-6" />
              </div>
            </div>

            <h3 className="text-gray-500 text-xs md:text-sm font-medium">
              Active Courses
            </h3>

            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {courses.length}
            </p>
          </div>

          {/* Students */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 md:p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <Users size={20} className="md:w-6 md:h-6" />
              </div>
            </div>

            <h3 className="text-gray-500 text-xs md:text-sm font-medium">
              Enrolled Students
            </h3>

            <p className="text-xl md:text-2xl font-bold text-gray-900">
              {totalStudents + successTransactions.length}
            </p>
          </div>

        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">

          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto">

            <button
              onClick={() => setActiveTab('courses')}
              className={`px-6 md:px-8 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'courses'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Courses
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-6 md:px-8 py-4 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'approvals'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending Approvals

              {pendingTransactions.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingTransactions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 md:px-8 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 md:px-8 py-4 font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings size={16} />
              Settings
            </button>

          </div>

          {/* Courses */}
          {activeTab === 'courses' && (
            <div className="overflow-x-auto">

              {courses.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <BookOpen
                    size={48}
                    className="mx-auto text-gray-200 mb-4"
                  />

                  <p>No courses available.</p>

                  <Button
                    onClick={onAddCourse}
                    className="mt-4"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Add Course
                  </Button>
                </div>
              ) : (
                <table className="w-full text-left text-sm min-w-[900px]">

                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4">
                        Course
                      </th>

                      <th className="px-6 py-4">
                        Price
                      </th>

                      <th className="px-6 py-4">
                        Students
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {courses.map(course => (
                      <tr
                        key={course.id}
                        className="hover:bg-gray-50 transition-colors"
                      >

                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">
                            {course.title}
                          </div>

                          {course.description && (
                            <div className="text-xs text-gray-500 truncate max-w-[300px]">
                              {course.description}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium">
                          {formatCurrency(course.price)}
                        </td>

                        <td className="px-6 py-4">
                          {course.students}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} />
                            Active
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">

                            <button
                              onClick={() =>
                                onShareCourse(
                                  course.id,
                                  course.title
                                )
                              }
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Share Course Link"
                            >
                              <Share2 size={18} />
                            </button>

                            <button
                              onClick={() =>
                                setSelectedCourseOrders(course.id)
                              }
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="View Orders"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() =>
                                onEditCourse(course)
                              }
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit Course"
                            >
                              <Edit size={18} />
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete "${course.title}"?`
                                  )
                                ) {
                                  onDeleteCourse(course.id);
                                }
                              }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>
              )}

            </div>
          )}

          {/* Pending Approvals */}
          {activeTab === 'approvals' && (
            <div className="overflow-x-auto">

              {pendingTransactions.length === 0 ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                  <CheckCircle
                    size={48}
                    className="text-green-200 mb-4"
                  />

                  <p>
                    All caught up! No pending approvals.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm min-w-[800px] md:min-w-full">

                  <thead className="bg-amber-50 text-amber-900 font-medium">
                    <tr>
                      <th className="px-6 py-4">
                        Date
                      </th>

                      <th className="px-6 py-4">
                        Customer
                      </th>

                      <th className="px-6 py-4">
                        Paid
                      </th>

                      <th className="px-6 py-4">
                        UTR/Txn ID
                      </th>

                      <th className="px-6 py-4 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {pendingTransactions.map(t => (
                      <tr
                        key={t.id}
                        className="hover:bg-amber-50/30 transition-colors"
                      >

                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(t.date).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">
                            {t.customerName}
                          </div>

                          <div className="text-xs text-gray-500">
                            {t.customerPhone}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-bold">
                          {formatCurrency(t.amount)}

                          {t.couponCode && (
                            <div className="text-[10px] text-green-600 bg-green-50 px-1 rounded inline-block ml-1">
                              {t.couponCode}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs bg-gray-50 rounded p-1 select-all">
                          {t.transactionId || 'Not Provided'}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">

                            <button
                              onClick={() =>
                                handleApproval(
                                  t,
                                  'approved'
                                )
                              }
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-bold shadow-sm"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                handleApproval(
                                  t,
                                  'rejected'
                                )
                              }
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold"
                            >
                              Reject
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>
              )}

            </div>
          )}

          {/* Transactions */}
          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm min-w-[800px] md:min-w-full">

                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Customer
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No transactions yet.
                      </td>
                    </tr>
                  ) : (
                    [...transactions]
                      .reverse()
                      .map(t => (
                        <tr
                          key={t.id}
                          className="hover:bg-gray-50"
                        >

                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {new Date(
                              t.date
                            ).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {t.customerName}
                            </div>

                            <div className="text-xs text-gray-400">
                              {t.customerPhone}
                            </div>
                          </td>

                          <td className="px-6 py-4 font-medium whitespace-nowrap">
                            {formatCurrency(t.amount)}
                          </td>

                          <td className="px-6 py-4">

                            {t.status === 'success' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle size={12} />
                                Paid
                              </span>
                            ) : t.approvalStatus === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Clock size={12} />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertCircle size={12} />
                                Failed
                              </span>
                            )}

                          </td>

                        </tr>
                      ))
                  )}

                </tbody>
              </table>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="p-8 max-w-2xl">

              {/* Payment Links */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Link2 className="text-indigo-600" />
                Payment Links (by Amount)
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                Add one payment link per exact price a customer might pay -
                the full course price, and one for every coupon-discounted
                price. Checkout will automatically open the link that
                matches what the customer actually owes.
              </p>

              <div className="space-y-3 mb-4">

                {paymentLinks.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    No payment links added yet.
                  </p>
                )}

                {paymentLinks.map(link => (
                  <div
                    key={link.id}
                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >

                    <div className="w-full sm:w-32">
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Amount (₹)
                      </label>

                      <input
                        type="number"
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="499"
                        value={link.amount || ''}
                        onChange={e =>
                          updatePaymentLinkRow(
                            link.id,
                            'amount',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Payment Link URL
                      </label>

                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                        placeholder="https://p.ppsl.io/PYTMPS/..."
                        value={link.url}
                        onChange={e =>
                          updatePaymentLinkRow(
                            link.id,
                            'url',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="w-full sm:w-36">
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Note (optional)
                      </label>

                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="e.g. SAVE20 price"
                        value={link.label || ''}
                        onChange={e =>
                          updatePaymentLinkRow(
                            link.id,
                            'label',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <button
                      onClick={() =>
                        removePaymentLinkRow(link.id)
                      }
                      className="self-end sm:self-center text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>
                ))}

              </div>

              <div className="flex flex-wrap items-center gap-3 mb-10">

                <Button
                  onClick={addPaymentLinkRow}
                  className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1"
                >
                  <PlusCircle size={16} />
                  Add Payment Link
                </Button>

                <Button
                  onClick={handleSavePaymentLinks}
                  disabled={isSavingPaymentLinks}
                >
                  {isSavingPaymentLinks
                    ? 'Saving...'
                    : 'Save Payment Links'}
                </Button>

              </div>

              {/* Manual UPI */}
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Smartphone className="text-indigo-600" />
                Payment Gateway Settings (Manual UPI)
              </h3>

              <div className="space-y-6">

                {/* Merchant Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Merchant Name (Display Name)
                  </label>

                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Ekbal Singh"
                    value={merchantSettings.name}
                    onChange={e =>
                      setMerchantSettings(prev => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                  />
                </div>

                {/* UPI ID */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    UPI ID (VPA)
                  </label>

                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="e.g. paytmqr...@paytm"
                    value={merchantSettings.upiId}
                    onChange={e =>
                      setMerchantSettings(prev => ({
                        ...prev,
                        upiId: e.target.value
                      }))
                    }
                  />
                </div>

                {/* Mobile + Merchant ID */}
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Mobile Number
                    </label>

                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. 77620..."
                      value={merchantSettings.number}
                      onChange={e =>
                        setMerchantSettings(prev => ({
                          ...prev,
                          number: e.target.value
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Merchant ID
                    </label>

                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. TmgGW..."
                      value={merchantSettings.merchantId}
                      onChange={e =>
                        setMerchantSettings(prev => ({
                          ...prev,
                          merchantId: e.target.value
                        }))
                      }
                    />
                  </div>

                </div>

                <div className="pt-4">

                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings
                      ? 'Saving...'
                      : 'Save Settings'}
                  </Button>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* View Orders Modal */}
      {selectedCourseOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() =>
              setSelectedCourseOrders(null)
            }
          ></div>

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95">

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">

              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  Order History
                </h3>

                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {selectedCourseTitle}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedCourseOrders(null)
                }
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>

            </div>

            {/* Orders */}
            <div className="overflow-y-auto flex-1 p-0">

              <div className="overflow-x-auto">

                <table className="w-full text-sm text-left min-w-[500px]">

                  <thead className="bg-gray-50 text-gray-500 sticky top-0">
                    <tr>
                      <th className="px-6 py-3">
                        Customer
                      </th>

                      <th className="px-6 py-3">
                        Phone
                      </th>

                      <th className="px-6 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {getOrdersForCourse(
                      selectedCourseOrders
                    ).length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-8 text-center text-gray-400"
                        >
                          No orders found for this course.
                        </td>
                      </tr>
                    ) : (
                      getOrdersForCourse(
                        selectedCourseOrders
                      ).map(t => (
                        <tr key={t.id}>

                          <td className="px-6 py-4">

                            <div className="font-bold text-gray-800">
                              {t.customerName}
                            </div>

                            <div className="text-xs text-gray-500">
                              {t.customerEmail}
                            </div>

                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {t.customerPhone || '-'}
                          </td>

                          <td className="px-6 py-4">

                            {t.status === 'success' ? (
                              <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                                <CheckCircle size={12} />
                                Paid
                              </span>
                            ) : t.approvalStatus === 'pending' ? (
                              <span className="text-amber-600 font-bold text-xs flex items-center gap-1">
                                <Clock size={12} />
                                Pending
                              </span>
                            ) : (
                              <span className="text-red-600 font-bold text-xs flex items-center gap-1">
                                <AlertCircle size={12} />
                                Failed
                              </span>
                            )}

                          </td>

                        </tr>
                      ))
                    )}

                  </tbody>
                </table>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
