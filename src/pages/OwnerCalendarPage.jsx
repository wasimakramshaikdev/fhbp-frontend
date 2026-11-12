import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Unlock, ShieldAlert, CheckCircle2, Clock, Building2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner, EmptyState } from '../components/ui/Feedback';

export const OwnerCalendarPage = () => {
  const { showSuccess, showError } = useToast();

  const [halls, setHalls] = useState([]);
  const [selectedHallId, setSelectedHallId] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [calendarMatrix, setCalendarMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  // Slot Action Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('EVENING');
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Fetch Owner's Listings
  useEffect(() => {
    const fetchOwnerHalls = async () => {
      try {
        const res = await api.get('/owner/listings/');
        if (res.success && res.data.length > 0) {
          setHalls(res.data);
          setSelectedHallId(res.data[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        showError('Failed to load owner properties');
        setLoading(false);
      }
    };
    fetchOwnerHalls();
  }, []);

  // 2. Fetch Availability Matrix for Selected Hall & Month
  const fetchMonthAvailability = async () => {
    if (!selectedHallId) return;
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const res = await api.get(`/halls/${selectedHallId}/availability/?year=${year}&month=${month}`);
      if (res.success) {
        setCalendarMatrix(res.data.calendar || {});
      }
    } catch (err) {
      showError('Failed to load calendar availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthAvailability();
  }, [selectedHallId, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleOpenSlotModal = (dateStr, slotType) => {
    setSelectedDateStr(dateStr);
    setSelectedSlot(slotType);
    setBlockReason('');
    setModalOpen(true);
  };

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post(`/halls/${selectedHallId}/availability/block/`, {
        date: selectedDateStr,
        slot: selectedSlot,
        reason: blockReason || 'Owner Reserved',
      });
      if (res.success) {
        showSuccess(res.message);
        setModalOpen(false);
        fetchMonthAvailability();
      }
    } catch (err) {
      showError(err.message || 'Failed to block slot');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockSlot = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/halls/${selectedHallId}/availability/unblock/`, {
        date: selectedDateStr,
        slot: selectedSlot,
      });
      if (res.success) {
        showSuccess(res.message);
        setModalOpen(false);
        fetchMonthAvailability();
      }
    } catch (err) {
      showError(err.message || 'Failed to unblock slot');
    } finally {
      setActionLoading(false);
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in Month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const currentSlotStatus = selectedDateStr && calendarMatrix[selectedDateStr]?.[selectedSlot]?.status || 'OPEN';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Availability Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Manage real-time date availability, block slots for maintenance, and monitor bookings</p>
        </div>

        {halls.length > 1 && (
          <div className="w-full sm:w-64">
            <Select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
            >
              {halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.locality})
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {halls.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No venues found"
          description="You need at least one listed venue to manage an availability calendar."
        />
      ) : (
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handlePrevMonth} icon={ChevronLeft}>
                Prev
              </Button>
              <h2 className="text-lg font-bold text-slate-900 min-w-40 text-center">
                {monthName}
              </h2>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Wireframe Legend (▢ Open  ▣ Booked  ▦ Blocked) */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-400" />
                <span className="text-slate-700">▢ Open</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-indigo-600 border border-indigo-700" />
                <span className="text-slate-700">▣ Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-400 border border-slate-500" />
                <span className="text-slate-700">▦ Blocked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-400 border border-amber-500" />
                <span className="text-slate-700">⏳ Held</span>
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-6">
            {loading ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-2">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 pb-2">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells before month start */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-28 rounded-2xl bg-slate-50/50 border border-transparent" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const dayData = calendarMatrix[dateStr] || {
                      MORNING: { status: 'OPEN' },
                      EVENING: { status: 'OPEN' },
                      FULL_DAY: { status: 'OPEN' },
                    };

                    return (
                      <div
                        key={dateStr}
                        className="min-h-28 p-2 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 transition flex flex-col justify-between shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{dayNum}</span>
                        </div>

                        {/* Slot Badges */}
                        <div className="space-y-1 my-1">
                          {['MORNING', 'EVENING'].map((slotKey) => {
                            const st = dayData[slotKey]?.status || 'OPEN';
                            const isBooked = st === 'BOOKED';
                            const isBlocked = st === 'BLOCKED';
                            const isHeld = st === 'HELD';

                            return (
                              <button
                                key={slotKey}
                                type="button"
                                onClick={() => handleOpenSlotModal(dateStr, slotKey)}
                                className={`w-full py-1 px-1.5 rounded-lg text-[10px] font-bold text-left truncate transition ${
                                  isBooked
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : isBlocked
                                    ? 'bg-slate-200 text-slate-700 border border-slate-300'
                                    : isHeld
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {slotKey === 'MORNING' ? 'Morn' : 'Eve'}: {st}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Slot Manager Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Manage Slot: ${selectedSlot} (${selectedDateStr})`}
        description="Change availability, block slot for maintenance, or unblock for bookings."
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500">Current Status:</span>
            <Badge
              variant={
                currentSlotStatus === 'BOOKED'
                  ? 'primary'
                  : currentSlotStatus === 'BLOCKED'
                  ? 'default'
                  : currentSlotStatus === 'HELD'
                  ? 'warning'
                  : 'success'
              }
            >
              {currentSlotStatus}
            </Badge>
          </div>

          {currentSlotStatus === 'BOOKED' ? (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 space-y-1">
              <span className="font-bold block">Confirmed Booking Present</span>
              <p>This slot has a confirmed customer reservation. To cancel or reschedule, please use the Bookings manager.</p>
            </div>
          ) : currentSlotStatus === 'BLOCKED' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                This slot is currently blocked by you. Unblocking will immediately make it open for customer discovery and instant bookings.
              </p>
              <Button
                variant="success"
                className="w-full"
                onClick={handleUnblockSlot}
                isLoading={actionLoading}
                icon={Unlock}
              >
                Unblock Slot to OPEN
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBlockSlot} className="space-y-4">
              <Input
                label="Reason for Blocking"
                placeholder="e.g. Maintenance, Hall Renovation, Private Event"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                isLoading={actionLoading}
                icon={Lock}
              >
                Block Date & Slot
              </Button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
