import { supabase } from './supabase';

// ─── TRIPS ────────────────────────────────────────────────────────

export async function fetchTrips(userId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(t => ({
    ...t,
    id: t.id,
    name: t.name,
    destination: t.destination,
    departureDate: t.departure_date,
    returnDate: t.return_date,
    budget: parseFloat(t.budget) || 0,
    currency: t.currency,
    country: t.country || null,
    isMultiLeg: t.is_multi_leg,
    legs: t.legs || [],
    dbId: t.id,
  }));
}

export async function createTrip(userId, trip) {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      name: trip.name,
      destination: trip.destination,
      departure_date: trip.departureDate,
      return_date: trip.returnDate,
      budget: trip.budget,
      currency: trip.currency,
      country: trip.country || null,
      is_multi_leg: trip.isMultiLeg || false,
      legs: trip.legs || [],
    })
    .select()
    .single();
  if (error) throw error;
  return { ...trip, dbId: data.id, id: data.id };
}

export async function updateTrip(tripId, trip) {
  const { error } = await supabase
    .from('trips')
    .update({
      name: trip.name,
      destination: trip.destination,
      departure_date: trip.departureDate,
      return_date: trip.returnDate,
      budget: trip.budget,
      currency: trip.currency,
      country: trip.country || null,
      is_multi_leg: trip.isMultiLeg || false,
      legs: trip.legs || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripId);
  if (error) throw error;
}

export async function deleteTrip(tripId) {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw error;
}

// ─── EXPENSES ─────────────────────────────────────────────────────

export async function fetchExpenses(tripId) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(e => ({
    id: e.id,
    title: e.title,
    amount: parseFloat(e.amount) || 0,
    category: e.category,
    phase: e.phase,
    date: e.date,
    payment: e.payment,
    status: e.status,
    planned: e.planned,
    notes: e.notes || '',
    refundable: e.refundable,
    shared: e.shared,
    sharedCount: e.shared_count || 1,
    estimated: parseFloat(e.estimated) || 0,
    isDailySummary: e.is_daily_summary,
    originalAmount: parseFloat(e.original_amount) || 0,
    originalCurrency: e.original_currency || 'USD',
    exchangeRate: parseFloat(e.exchange_rate) || 1,
    legId: e.leg_id,
    dbId: e.id,
  }));
}

export async function createExpense(userId, tripId, expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      trip_id: tripId,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      phase: expense.phase,
      date: expense.date,
      payment: expense.payment,
      status: expense.status,
      planned: expense.planned || false,
      notes: expense.notes || '',
      refundable: expense.refundable || false,
      shared: expense.shared || false,
      shared_count: expense.sharedCount || 1,
      estimated: expense.estimated || 0,
      is_daily_summary: expense.isDailySummary || false,
      original_amount: expense.originalAmount || expense.amount,
      original_currency: expense.originalCurrency || 'USD',
      exchange_rate: expense.exchangeRate || 1,
      leg_id: expense.legId,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...expense, id: data.id, dbId: data.id };
}

export async function updateExpense(expenseId, expense) {
  const { error } = await supabase
    .from('expenses')
    .update({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      phase: expense.phase,
      date: expense.date,
      payment: expense.payment,
      status: expense.status,
      planned: expense.planned || false,
      notes: expense.notes || '',
      refundable: expense.refundable || false,
      shared: expense.shared || false,
      shared_count: expense.sharedCount || 1,
      estimated: expense.estimated || 0,
      original_amount: expense.originalAmount || expense.amount,
      original_currency: expense.originalCurrency || 'USD',
      exchange_rate: expense.exchangeRate || 1,
      leg_id: expense.legId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', expenseId);
  if (error) throw error;
}

export async function deleteExpense(expenseId) {
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  if (error) throw error;
}

// ─── USER PROFILE ─────────────────────────────────────────────────

export async function getUserTripCount(userId) {
  const { count, error } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count || 0;
}
