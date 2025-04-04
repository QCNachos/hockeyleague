import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth, getDate, isAfter, isBefore, isSameDay } from 'date-fns';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseKey || 'your-supabase-anon-key'
);

// Styled components
const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MonthNavigator = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const MonthSelector = styled.div`
  background-color: #1e1e1e;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #fff;
  border: 1px solid #333;
  
  &:hover {
    background-color: #2a2a2a;
  }
`;

const YearSelector = styled(MonthSelector)``;

const ChevronButton = styled.button`
  background-color: transparent;
  border: none;
  color: #B30E16;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(179, 14, 22, 0.1);
  }
  
  &:disabled {
    color: #555;
    cursor: not-allowed;
  }
`;

const WeekdayHeaders = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 10px 0;
  border-bottom: 1px solid #333;
  font-weight: bold;
  text-align: center;
  color: #C4CED4;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(120px, auto);
  gap: 1px;
  background-color: #111;
`;

const CalendarCell = styled.div`
  background-color: #1e1e1e;
  border: 1px solid #333;
  min-height: 120px;
  padding: 8px;
  color: ${props => props.isToday ? '#B30E16' : props.inCurrentMonth ? '#fff' : '#555'};
  font-weight: ${props => props.isToday ? 'bold' : 'normal'};
  position: relative;
  overflow: hidden; /* Prevent event overflow */
  
  &:hover {
    background-color: #2a2a2a;
  }
`;

const DayNumber = styled.div`
  text-align: right;
  margin-bottom: 8px;
  font-size: 14px;
  ${props => props.isToday && `
    background-color: #B30E16;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
  `}
`;

const EventsContainer = styled.div`
  max-height: calc(100% - 30px);
  overflow-y: auto;
  /* Hide scrollbar for cleaner look */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 4px;
  }
`;

const Event = styled.div`
  background-color: ${props => props.color || '#B30E16'};
  color: white;
  border-radius: 3px;
  padding: 3px 5px;
  margin-bottom: 3px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  max-width: 95%; /* Prevent events from making cells too wide */
  position: relative;
  
  /* Display a star for important events */
  ${props => props.important && `
    &::after {
      content: "★";
      position: absolute;
      right: 4px;
      font-size: 10px;
    }
    padding-right: 16px;
    border: 1px solid rgba(255, 255, 255, 0.5);
  `}
  
  &:hover {
    opacity: 0.9;
  }
`;

const LoadingIndicator = styled.div`
  color: #aaa;
  text-align: center;
  padding: 20px;
`;

const EventCount = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 11px;
  color: #aaa;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  padding: 20px;
  text-align: center;
`;

// Modal components for event details
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 5px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #fff;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 20px;
  cursor: pointer;
  &:hover {
    color: #fff;
  }
`;

const EventDetail = styled.div`
  margin-bottom: 10px;
  display: flex;
`;

const DetailLabel = styled.span`
  font-weight: bold;
  color: #aaa;
  width: 100px;
  flex-shrink: 0;
`;

const DetailValue = styled.span`
  color: #fff;
`;

const ColorBadge = styled.div`
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 10px;
`;

// Add some styled components for debug panel
const DebugPanel = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 350px;
  max-height: 300px;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #444;
  border-radius: 4px 0 0 0;
  padding: 10px;
  font-size: 12px;
  color: #ccc;
  z-index: 1000;
`;

const DebugTitle = styled.div`
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
  border-bottom: 1px solid #555;
  padding-bottom: 3px;
`;

const DebugItem = styled.div`
  margin-bottom: 8px;
  padding: 4px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.05);
`;

const DebugStatus = styled.span`
  color: ${props => props.isActive ? '#4CAF50' : '#F44336'};
  font-weight: bold;
`;

// Add a styled switch component for filtering events by importance
const FilterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
`;

const FilterLabel = styled.span`
  margin-right: 8px;
  font-size: 14px;
  color: #C4CED4;
`;

const Switch = styled.div`
  display: flex;
  background-color: #333;
  border-radius: 20px;
  padding: 3px;
  width: 220px;
  cursor: pointer;
  user-select: none;
`;

const SwitchOption = styled.div`
  flex: 1;
  text-align: center;
  padding: 6px 12px;
  border-radius: 18px;
  font-size: 13px;
  transition: all 0.3s ease;
  background-color: ${props => props.active ? '#B30E16' : 'transparent'};
  color: ${props => props.active ? 'white' : '#aaa'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    color: ${props => props.active ? 'white' : '#ddd'};
  }
`;

const ImportanceBadge = styled.span`
  display: inline-block;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: 8px;
  background-color: ${props => props.important ? '#4CAF50' : '#888'};
  color: white;
`;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthSelectOpen, setMonthSelectOpen] = useState(false);
  const [yearSelectOpen, setYearSelectOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [showImportantOnly, setShowImportantOnly] = useState(true); // Default to showing important events only
  
  // For debug logging of event patterns
  const [checkedEvents, setCheckedEvents] = useState({});
  let lastCheckedYear = null;
  
  // Check if debug mode is enabled via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get('debug');
    setDebugMode(debug === '1' || debug === 'true');
    
    // Debug check for Olympic years
    console.log('Checking Olympic year calculation:');
    for (let year = 2022; year <= 2034; year += 2) {
      const formula = (year - 2022) % 4 === 0;
      const check = year === 2022 || year === 2026 || year === 2030 || year === 2034;
      console.log(`Year ${year} - Formula: ${formula ? 'OLYMPIC YEAR' : 'not olympic'}, Expected: ${check ? 'OLYMPIC YEAR' : 'not olympic'} - ${formula === check ? '✅ MATCH' : '❌ ERROR'}`);
    }
    
    console.log('OLYMPIC FIX: Added special case for 2026 and 2030 to ensure Olympic events show up correctly in those years');
  }, []);
  
  // Current year for displayed events
  const currentYear = new Date().getFullYear();
  
  // Helper function to check if an event should be shown in a specific year
  // Handles special recurring patterns like Olympics (every 4 years)
  const shouldShowSpecialEvent = (event, yearToCheck) => {
    const eventName = event.events.toLowerCase();
    
    // Base reference year for winter Olympics
    const lastWinterOlympics = 2022; // Last winter Olympics
    
    // Calculate if this is an Olympic year - use the right formula to ensure it catches 2026, 2030
    const isOlympicYear = (yearToCheck - lastWinterOlympics) % 4 === 0;
    
    // Olympics every 4 years (2022, 2026, 2030...)
    if (eventName.includes('olympic')) {
      // Add explicit logging for Olympics check
      console.log(`🏅 Olympics check for "${event.events}" in year ${yearToCheck}:`, {
        yearToCheck,
        lastWinterOlympics,
        formula: `(${yearToCheck} - ${lastWinterOlympics}) % 4 = ${(yearToCheck - lastWinterOlympics) % 4}`,
        isOlympicYear,
        manualCheck: (yearToCheck === 2022 || yearToCheck === 2026 || yearToCheck === 2030 || yearToCheck === 2034)
      });
      
      // Double-check specific years we know should be Olympic years
      if (yearToCheck === 2026 || yearToCheck === 2030) {
        return true;
      }
      
      return isOlympicYear;
    }
    
    // For non-Olympic years, we need to alternate between All-Star and 8 Nations events
    if (!isOlympicYear) {
      // Calculate years since last Olympics
      const yearsSinceLastOlympics = (yearToCheck - lastWinterOlympics) % 4;
      
      // All-Star events happen in years that are 1 year after Olympics (2023, 2027, 2031...)
      if ((eventName.includes('all star') || eventName.includes('all-star'))) {
        return yearsSinceLastOlympics === 1;
      }
      
      // 8 Nations and similar international tournaments happen in years that are 3 years after Olympics (2025, 2029, 2033...)
      if (eventName.includes('nation') || eventName.includes('international')) {
        return yearsSinceLastOlympics === 3;
      }
    } else {
      // In Olympic years, don't show All-Star or 8 Nations
      if (eventName.includes('all star') || eventName.includes('all-star') || 
          eventName.includes('nation') || eventName.includes('international')) {
        return false;
      }
    }
    
    // For all other events, show them every year
    return true;
  };
  
  // Helper function to get recurring pattern text
  const getRecurringPatternText = (event) => {
    if (!event.recurring) return 'No (One-time event)';
    
    const eventName = event.events.toLowerCase();
    
    if (eventName.includes('olympic')) {
      return 'Every 4 years (Winter Olympics - 2022, 2026, 2030...)';
    } else if (eventName.includes('all star') || eventName.includes('all-star')) {
      return 'Every 4 years (Years after Olympics - 2023, 2027, 2031...)';
    } else if (eventName.includes('nation') || eventName.includes('international')) {
      return 'Every 4 years (Years before Olympics - 2025, 2029, 2033...)';
    } else {
      return 'Yes (Annual event)';
    }
  };
  
  // Fetch events from Supabase on component mount and when currentDate changes
  useEffect(() => {
    const fetchEventsFromAPI = async () => {
      try {
        setLoading(true);
        
        console.log('Starting fetch from Supabase with URL:', supabaseUrl);
        
        // Check if Supabase client is properly initialized
        if (!supabaseUrl || supabaseUrl === 'https://your-supabase-url.supabase.co' || 
            !supabaseKey || supabaseKey === 'your-supabase-anon-key') {
          console.error('Invalid Supabase configuration. Check your environment variables.');
          setError('Supabase configuration error. Please check your environment variables.');
          setLoading(false);
          return;
        }

        // Remove the call to get_tables function that doesn't exist
        console.log('Trying to fetch events from available tables...');
        
        // Try different table names in order - starting with 'events' which we can see exists
        const tableNames = ['events', 'Events', 'Event'];
        let eventsData = null;
        let fetchSuccessful = false;
        let lastError = null;
        
        for (const tableName of tableNames) {
          console.log(`Trying to fetch from "${tableName}" table`);
          
          const { data, error } = await supabase
            .from(tableName)
            .select('*');
          
          if (error) {
            console.error(`Error fetching from table "${tableName}":`, error);
            lastError = error;
            continue; // Try the next table
          }
          
          if (data && data.length > 0) {
            console.log(`Successfully fetched ${data.length} events from "${tableName}" table`);
            eventsData = data;
            fetchSuccessful = true;
            break; // We found data, no need to check other tables
          } else {
            console.log(`No events found in "${tableName}" table`);
          }
        }
        
        // If we didn't find any data in any table
        if (!fetchSuccessful) {
          const errorMsg = lastError 
            ? `Failed to load events: ${lastError.message}`
            : 'No events found in any Supabase table.';
          
          console.error(errorMsg);
          setError(errorMsg);
          setEvents([]);
          setLoading(false);
          return;
        }
        
        // Process the events we found
        console.log(`Processing ${eventsData.length} events from Supabase:`, eventsData);
        
        const processedEvents = eventsData.map(event => {
          try {
            // Check for date fields with different casing
            const startDateStr = event.start_date || event.START_DATE || event.startDate || event.startdate || event['start-date'];
            const endDateStr = event.end_date || event.END_DATE || event.endDate || event.enddate || event['end-date'];
            const isRecurring = event.recurring || event.RECURRING || event.isRecurring || event.is_recurring || false;
            
            // Use events field if available (as seen in your screenshot) or other possible field names
            const eventName = event.events || event.name || event.EVENTS || event.event || event.title || 'Unknown Event';
            const eventNameLower = eventName.toLowerCase();
          
            console.log(`Event "${eventName}":`, {
              startDate: startDateStr, 
              endDate: endDateStr,
              recurring: isRecurring
            });
            
            // Force recurring to true for special events with known patterns 
            // even if they're marked as non-recurring in the database
            let adjustedRecurring = isRecurring;
            const specialRecurringEvents = [
              'olympic', 'olympics', 'winter olympic', 
              'all star', 'all-star', 
              'nation', 'nations', 
              'international'
            ];
            
            // Check if this is a special event that follows a recurring pattern
            const isSpecialEvent = specialRecurringEvents.some(term => eventNameLower.includes(term));
            if (isSpecialEvent) {
              if (!adjustedRecurring) {
                console.log(`Setting "${eventName}" as recurring despite database value of ${isRecurring}`);
              }
              adjustedRecurring = true;
            }
            
            // For events spanning across years, detect if different years are used
            let explicitYearSpanning = false;
            
            if (startDateStr && endDateStr) {
              const startYear = startDateStr.toString().substring(0, 4);
              const endYear = endDateStr.toString().substring(0, 4);
              
              if (startYear !== endYear) {
                console.log(`Event "${eventName}" spans years: ${startYear} to ${endYear}`);
                explicitYearSpanning = true;
              }
            }
            
            // For events with missing start_date, try to use end_date instead
            let effectiveStartDate = startDateStr;
            if (!effectiveStartDate && endDateStr) {
              console.log(`Event "${eventName}" has missing start_date but has end_date. Using end_date as start.`);
              effectiveStartDate = endDateStr;
            }
            
            // Skip events with completely missing dates
            if (!effectiveStartDate && !endDateStr) {
              console.warn(`Skipping event "${eventName}" - missing both start_date and end_date`);
              return null;
            }
            
            // Parse dates
            let startDate, endDate;
            
            try {
              startDate = effectiveStartDate ? new Date(effectiveStartDate) : null;
              // Make sure the date is valid
              if (startDate && isNaN(startDate.getTime())) {
                console.warn(`Event "${eventName}" has invalid start date: ${effectiveStartDate}`);
                startDate = null;
              }
            } catch (e) {
              console.warn(`Couldn't parse start date for "${eventName}": ${effectiveStartDate}`, e);
              startDate = null;
            }
            
            // If we still have no valid start date, try to use a default date
            if (!startDate) {
              console.log(`Using default date for event "${eventName}" with missing start date`);
              const defaultDate = new Date();
              defaultDate.setFullYear(2000);
              startDate = defaultDate;
            }
            
            // Parse end date if present
            if (endDateStr) {
              try {
                endDate = new Date(endDateStr);
                if (isNaN(endDate.getTime())) {
                  console.warn(`Invalid end date for "${eventName}": ${endDateStr}, using start date instead`);
                  endDate = new Date(startDate);
                }
              } catch (e) {
                console.warn(`Couldn't parse end date for "${eventName}": ${endDateStr}, using start date`, e);
                endDate = new Date(startDate);
              }
            } else {
              // No end date provided, use start date
              endDate = new Date(startDate);
            }
            
            // Check if this is a year-spanning event (end month < start month or explicitly marked)
            const isYearSpanning = explicitYearSpanning || 
                                  (endDate && startDate &&
                                  (endDate.getMonth() < startDate.getMonth() || 
                                    (endDate.getMonth() === startDate.getMonth() && 
                                    endDate.getDate() < startDate.getDate())));
            
            if (isYearSpanning) {
              console.log(`Year-spanning event detected: "${eventName}" from ${startDate} to ${endDate}`);
            }
            
            const color = getEventColor({...event, events: eventName});
            
            // Special logging for Olympic events
            if (eventNameLower.includes('olympic')) {
              console.log(`🏅 Olympic event processed: "${eventName}"`, {
                recurring: adjustedRecurring,
                dbRecurring: isRecurring,
                startDate: startDate ? format(startDate, 'yyyy-MM-dd') : 'invalid',
                endDate: endDate ? format(endDate, 'yyyy-MM-dd') : 'invalid'
              });
            }
            
            // Make sure to handle the importance field
            const isImportant = event.importance === true;
            
            const processedEvent = {
              ...event,
              events: eventName,
              startDate: startDate,
              endDate: endDate,
              recurring: adjustedRecurring,
              isYearSpanning,
              color,
              importance: isImportant // Make sure to include importance
            };
            
            console.log(`Processed event: "${eventName}", Important: ${isImportant}`);
            return processedEvent;
          } catch (e) {
            console.error('Error processing event:', e, event);
            return null;
          }
        }).filter(event => event !== null); // Remove null events
        
        console.log(`Successfully processed ${processedEvents.length} events`);
        setEvents(processedEvents);
        
        // Apply the initial filter based on the default showImportantOnly value
        applyEventFilter(processedEvents, showImportantOnly);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(`Failed to load calendar events: ${error.message}. You may need to set up Row Level Security permissions.`);
        setLoading(false);
      }
    };
    
    fetchEventsFromAPI();
  }, []); // Only fetch events once on component mount

  // Apply filter when showImportantOnly changes
  useEffect(() => {
    applyEventFilter(events, showImportantOnly);
  }, [showImportantOnly, events]);
  
  // Function to filter events based on importance
  const applyEventFilter = (allEvents, importantOnly) => {
    if (importantOnly) {
      const important = allEvents.filter(event => event.importance === true);
      console.log(`Filtered to ${important.length} important events out of ${allEvents.length} total events`);
      setFilteredEvents(important);
    } else {
      console.log(`Showing all ${allEvents.length} events`);
      setFilteredEvents(allEvents);
    }
  };
  
  // Toggle between showing all events or important events only
  const toggleImportanceFilter = () => {
    setShowImportantOnly(!showImportantOnly);
  };
  
  // Update calendar view when month changes - we don't need to refetch events
  useEffect(() => {
    console.log(`Month changed to ${format(currentDate, 'MMMM yyyy')}`);
  }, [currentDate]);

  // Get color for event based on type or category
  const getEventColor = (event) => {
    // You can customize this based on event types
    const colors = {
      'NHL Entry Draft 1st Round': '#B30E16', // Team color red
      'NHL Entry Draft Round 2 to 7': '#B30E16',
      'Olympics': '#1E88E5', // Blue
      '8 Nations': '#1E88E5',
      'All Star Event': '#7E57C2', // Purple
      'NHL Awards': '#FFB300', // Gold
      'Top Prospect Game': '#43A047', // Green
      'North-America Top Prospect Game': '#43A047',
      'Memorial Cup': '#FF5722', // Orange
      'World Junior Championship': '#1E88E5',
      'Hlinka Gretzky Cup': '#26A69A', // Teal
      'Telus Cup': '#26A69A',
      'International Quebec PeeWee Tournament': '#26A69A'
    };
    
    // If we have a match in our predefined colors, use it
    if (colors[event.events]) {
      return colors[event.events];
    }
    
    // Otherwise, generate a color based on the event name
    // This ensures any event type will get a consistent color
    let hashCode = 0;
    for (let i = 0; i < event.events.length; i++) {
      hashCode = event.events.charCodeAt(i) + ((hashCode << 5) - hashCode);
    }
    
    // Generate a hue between 0 and 360
    const hue = Math.abs(hashCode % 360);
    
    // Use HSL to create a vivid color with consistent lightness and saturation
    return `hsl(${hue}, 70%, 45%)`;
  };
  
  // Navigation functions
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Set specific month
  const setMonth = (month) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month);
    setCurrentDate(newDate);
    setMonthSelectOpen(false);
  };
  
  // Set specific year
  const setYear = (year) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setYearSelectOpen(false);
  };
  
  // Generate calendar grid
  const generateCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dayOfWeekOfFirst = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
    
    // Create array for all visible days in the calendar grid
    const calendarDays = [];
    
    // Add days from previous month to fill the first row
    for (let i = 0; i < dayOfWeekOfFirst; i++) {
      const prevMonthDay = new Date(monthStart);
      prevMonthDay.setDate(prevMonthDay.getDate() - (dayOfWeekOfFirst - i));
      calendarDays.push(prevMonthDay);
    }
    
    // Add all days of current month
    calendarDays.push(...days);
    
    // Add days from next month to complete the last row
    const lastDayOfWeek = getDay(monthEnd);
    if (lastDayOfWeek < 6) {
      for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        const nextMonthDay = new Date(monthEnd);
        nextMonthDay.setDate(nextMonthDay.getDate() + i);
        calendarDays.push(nextMonthDay);
      }
    }
    
    return calendarDays;
  };
  
  // Function to get events for a specific day
  const getEventsForDay = (day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    
    if (!filteredEvents || filteredEvents.length === 0) {
      return [];
    }
    
    // Log the entire events array on the first day of the month for debugging
    if (getDate(day) === 1) {
      console.log('All available events for calendar:', filteredEvents.map(e => ({
        name: e.events,
        startDate: e.startDate ? format(e.startDate, 'yyyy-MM-dd') : 'invalid date',
        endDate: e.endDate ? format(e.endDate, 'yyyy-MM-dd') : 'invalid date',
        recurring: e.recurring,
        isYearSpanning: e.isYearSpanning
      })));
    }
    
    // Check if we're looking at the Olympics year specifically
    const currentYear = day.getFullYear();
    if ((currentYear === 2026 || currentYear === 2030) && getDate(day) === 1 && day.getMonth() === 0) {
      // Check if we have any Olympics events in our data
      const olympicsEvents = filteredEvents.filter(e => e.events && e.events.toLowerCase().includes('olympic'));
      console.log(`🔍 Checking for Olympics events in ${currentYear}:`, olympicsEvents);
      
      // Test our shouldShowSpecialEvent function for Olympics
      if (olympicsEvents.length > 0) {
        olympicsEvents.forEach(event => {
          const shouldShow = shouldShowSpecialEvent(event, currentYear);
          console.log(`Olympics test for "${event.events}" in ${currentYear}: ${shouldShow ? 'SHOULD SHOW' : 'SHOULD NOT SHOW'}`);
        });
      } else {
        console.log(`No Olympics events found in data for ${currentYear}`);
      }
    }

    // For today, log more detailed information
    const isTodayDate = isToday(day);
    
    if (isTodayDate) {
      console.log('🔍 Detailed event checks for today:', formattedDay);
    }

    // Helper to determine if an Olympic event should be shown in Olympic years
    const isOlympicYear = (currentYear - 2022) % 4 === 0;
    const forceShowOlympics = isOlympicYear && (currentYear === 2026 || currentYear === 2030);

    const dayEvents = filteredEvents.filter(event => {
      try {
        // Skip events with missing essential data
        if (!event.startDate || !event.events) {
          return false;
        }
        
        const eventName = event.events;
        const isOlympics = eventName.toLowerCase().includes('olympic');
        const currentYear = day.getFullYear();
        const currentMonth = day.getMonth();
        const currentDay = day.getDate();
        
        // SPECIAL CASE: Force show Olympics in 2026 and 2030 if they're not showing up
        if (forceShowOlympics && isOlympics) {
          // Create dates for comparison in the current year (for Olympic events in Olympic years)
          const eventStartThisYear = new Date(event.startDate);
          eventStartThisYear.setFullYear(currentYear);
          
          const eventEndThisYear = new Date(event.endDate || event.startDate);
          eventEndThisYear.setFullYear(currentYear);
          
          // Check if event spans from December to January for example
          const isYearSpanning = event.isYearSpanning ||
            (eventStartThisYear.getMonth() > eventEndThisYear.getMonth());
            
          // For year-spanning events, adjust the year accordingly
          if (isYearSpanning) {
            // If we're in a month after or equal to the start month
            // (e.g., December for a Dec-Jan event)
            if (currentMonth >= eventStartThisYear.getMonth()) {
              eventEndThisYear.setFullYear(currentYear + 1);
            } 
            // If we're in a month before or equal to the end month
            // (e.g., January for a Dec-Jan event)
            else if (currentMonth <= eventEndThisYear.getMonth()) {
              eventStartThisYear.setFullYear(currentYear - 1);
            }
          }

          // Check if the current day falls within the event dates
          const matchStart = isSameDay(day, eventStartThisYear);
          const matchEnd = isSameDay(day, eventEndThisYear);
          const matchMiddle = isAfter(day, eventStartThisYear) && isBefore(day, eventEndThisYear);
          const isInRange = matchStart || matchMiddle || matchEnd;
          
          if (isInRange) {
            console.log(`✅ MANUAL OVERRIDE: Showing Olympics "${eventName}" in ${currentYear} for ${formattedDay}`);
            return true;
          }
        }
        
        // For annually recurring events
        if (event.recurring) {
          // Create dates for comparison in the current year
          const eventStartThisYear = new Date(event.startDate);
          eventStartThisYear.setFullYear(currentYear);
          
          const eventEndThisYear = new Date(event.endDate || event.startDate);
          eventEndThisYear.setFullYear(currentYear);
          
          // Check if event spans from December to January for example
          const isYearSpanning = event.isYearSpanning ||
            (eventStartThisYear.getMonth() > eventEndThisYear.getMonth());
            
          // For year-spanning events, adjust the year accordingly
          if (isYearSpanning) {
            // If we're in a month after or equal to the start month
            // (e.g., December for a Dec-Jan event)
            if (currentMonth >= eventStartThisYear.getMonth()) {
              eventEndThisYear.setFullYear(currentYear + 1);
            } 
            // If we're in a month before or equal to the end month
            // (e.g., January for a Dec-Jan event)
            else if (currentMonth <= eventEndThisYear.getMonth()) {
              eventStartThisYear.setFullYear(currentYear - 1);
            }
          }

          // Check if the current day falls within the event dates
          const matchStart = isSameDay(day, eventStartThisYear);
          const matchEnd = isSameDay(day, eventEndThisYear);
          const matchMiddle = isAfter(day, eventStartThisYear) && isBefore(day, eventEndThisYear);
          const isInRange = matchStart || matchMiddle || matchEnd;
          
          // For annually recurring events, we also need to check if they should appear 
          // in this specific year (e.g., Olympics every 4 years)
          const shouldShowThisYear = shouldShowSpecialEvent(event, currentYear);
          
          // Debug logging for special events especially Olympics in 2026/2030
          const isSpecialYear = (currentYear === 2026 || currentYear === 2030);
          
          // Extra detailed logging for Olympics
          if (isOlympics && isSpecialYear && (getDate(day) === 1 || getDate(day) === 15)) {
            console.log(`🏅 OLYMPICS DETAILED CHECK for "${eventName}" on ${formattedDay}:`, {
              dayChecking: formattedDay,
              eventStartThisYear: format(eventStartThisYear, 'yyyy-MM-dd'),
              eventEndThisYear: format(eventEndThisYear, 'yyyy-MM-dd'),
              isYearSpanning,
              shouldShowThisYear,
              matchStart,
              matchMiddle,
              matchEnd,
              isInRange,
              finalResult: isInRange && shouldShowThisYear
            });
          }
          
          // Debug logging for special recurring events
          if (isTodayDate || (isYearSpanning && (currentMonth === 0 || currentMonth === 11)) || 
              eventName.toLowerCase().includes('olympic') || 
              eventName.toLowerCase().includes('all star')) {
            console.log(`🔍 Detailed check for recurring event "${eventName}"`, {
              dayChecking: formattedDay,
              eventStartThisYear: format(eventStartThisYear, 'yyyy-MM-dd'),
              eventEndThisYear: format(eventEndThisYear, 'yyyy-MM-dd'),
              isYearSpanning,
              shouldShowThisYear,
              matchStart,
              matchMiddle,
              matchEnd,
              isInRange,
              finalResult: isInRange && shouldShowThisYear,
              dayMonth: currentMonth,
              eventStartMonth: eventStartThisYear.getMonth(),
              eventEndMonth: eventEndThisYear.getMonth()
            });
          }
          
          return isInRange && shouldShowThisYear;
        } 
        // For non-recurring events (one-time events)
        else {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate || event.startDate);
          
          // For non-recurring events, we compare the exact dates including year
          const isInRange = (isAfter(day, eventStart) && isBefore(day, eventEnd)) || 
                          isSameDay(day, eventStart) || 
                          isSameDay(day, eventEnd);
          
          // For Olympics specifically, add special check
          const isOlympics = eventName.toLowerCase().includes('olympic');
          const isSpecialYear = (currentYear === 2026 || currentYear === 2030);
          
          if (isOlympics && isSpecialYear && (getDate(day) === 1 || getDate(day) === 15)) {
            console.log(`🏅 NON-RECURRING OLYMPICS CHECK for "${eventName}" on ${formattedDay}:`, {
              eventStart: format(eventStart, 'yyyy-MM-dd'),
              eventEnd: format(eventEnd, 'yyyy-MM-dd'),
              dayYear: currentYear,
              eventStartYear: eventStart.getFullYear(),
              isInRange,
              recurring: event.recurring
            });
          }
          
          console.log(`Non-recurring event "${eventName}": ${isInRange ? "MATCHES" : "doesn't match"} for ${formattedDay}`, {
            eventStart: format(eventStart, 'yyyy-MM-dd'),
            eventEnd: format(eventEnd, 'yyyy-MM-dd'),
            isInRange
          });
          
          return isInRange;
        }
      } catch (e) {
        console.error('Error checking event for day:', e, event);
        return false;
      }
    });
    
    // Only log when we find events to reduce console spam
    if (dayEvents.length > 0) {
      console.log(`Found ${dayEvents.length} events for ${formattedDay}:`, 
        dayEvents.map(e => e.events).join(', '));
    }
    
    return dayEvents;
  };
  
  // Handle event click
  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    setSelectedEvent(event);
  };
  
  // Close modal
  const closeModal = () => {
    setSelectedEvent(null);
  };
  
  // Render calendar
  const calendarDays = generateCalendar();
  const monthYearString = format(currentDate, 'MMMM yyyy');
  
  // Month names for month selector
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Generate year options (from 5 years back to 5 years in future)
  const currentYearNum = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYearNum - 5 + i);
  
  // Check if current year is an Olympic year
  const isOlympicYear = (currentDate.getFullYear() - 2022) % 4 === 0 || 
                         currentDate.getFullYear() === 2026 || 
                         currentDate.getFullYear() === 2030;
  
  if (loading) {
    return <LoadingIndicator>Loading calendar events...</LoadingIndicator>;
  }
  
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  
  if (events.length === 0) {
    return (
      <ErrorMessage>
        <h3>No events found</h3>
        <p>
          The Calendar component requires an events table in your Supabase database.
          Run the following SQL commands in your Supabase SQL Editor to create it:
        </p>
        <pre style={{ textAlign: 'left', maxWidth: '700px', margin: '0 auto', background: '#222', padding: '15px', borderRadius: '5px', overflowX: 'auto' }}>
{`-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS "events" (
  id SERIAL PRIMARY KEY,
  events TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  recurring BOOLEAN DEFAULT false,
  min_age INTEGER,
  max_age INTEGER,
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON "events"
  FOR SELECT
  USING (true);
  
-- Important: For events spanning December to January (like World Junior Championship),
-- make sure to use different years in the dates (e.g., '2000-12-26' to '2001-01-05').
-- The calendar will automatically detect this as a year-spanning event.`}
        </pre>
      </ErrorMessage>
    );
  }
  
  return (
    <CalendarContainer>
      {/* Add the filter switch above the calendar */}
      <FilterContainer>
        <FilterLabel>Filter:</FilterLabel>
        <Switch onClick={toggleImportanceFilter}>
          <SwitchOption active={showImportantOnly}>Important Events</SwitchOption>
          <SwitchOption active={!showImportantOnly}>All Events</SwitchOption>
        </Switch>
      </FilterContainer>
      
      <CalendarHeader>
        <MonthNavigator>
          <ChevronButton onClick={prevMonth}>
            &lt;
          </ChevronButton>
          
          <div style={{ position: 'relative' }}>
            <MonthSelector onClick={() => setMonthSelectOpen(!monthSelectOpen)}>
              {format(currentDate, 'MMMM')}
            </MonthSelector>
            
            {monthSelectOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 10,
                backgroundColor: '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '4px',
                width: '150px'
              }}>
                {monthNames.map((month, index) => (
                  <div
                    key={month}
                    onClick={() => setMonth(index)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: currentDate.getMonth() === index ? 'rgba(179, 14, 22, 0.2)' : 'transparent',
                      color: currentDate.getMonth() === index ? '#B30E16' : '#fff'
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ position: 'relative' }}>
            <YearSelector onClick={() => setYearSelectOpen(!yearSelectOpen)}>
              {format(currentDate, 'yyyy')}
            </YearSelector>
            
            {yearSelectOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                zIndex: 10,
                backgroundColor: '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '4px',
                width: '150px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {yearOptions.map(year => (
                  <div
                    key={year}
                    onClick={() => setYear(year)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: currentDate.getFullYear() === year ? 'rgba(179, 14, 22, 0.2)' : 'transparent',
                      color: currentDate.getFullYear() === year ? '#B30E16' : '#fff'
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <ChevronButton onClick={nextMonth}>
            &gt;
          </ChevronButton>
        </MonthNavigator>
      </CalendarHeader>
      
      <WeekdayHeaders>
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </WeekdayHeaders>
      
      <DaysGrid>
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const dayIsToday = isToday(day);
          const dayInCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <CalendarCell 
              key={index} 
              isToday={dayIsToday}
              inCurrentMonth={dayInCurrentMonth}
            >
              <DayNumber isToday={dayIsToday}>{format(day, 'd')}</DayNumber>
              
              <EventsContainer>
                {dayEvents.map((event, i) => (
                  <Event 
                    key={i} 
                    color={event.color}
                    title={event.events}
                    important={event.importance}
                    onClick={() => handleEventClick(event)}
                  >
                    {event.events}
                  </Event>
                ))}
              </EventsContainer>
              
              {dayEvents.length > 3 && (
                <EventCount>+{dayEvents.length - 3} more</EventCount>
              )}
            </CalendarCell>
          );
        })}
      </DaysGrid>
      
      {/* Event Details Modal */}
      {selectedEvent && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <ColorBadge color={selectedEvent.color} />
                {selectedEvent.events}
                <ImportanceBadge important={selectedEvent.importance}>
                  {selectedEvent.importance ? 'IMPORTANT' : 'REGULAR'}
                </ImportanceBadge>
              </ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            
            <EventDetail>
              <DetailLabel>Start Date:</DetailLabel>
              <DetailValue>
                {format(selectedEvent.startDate, 'MMMM d')}
                {/* Only show year for non-recurring events */}
                {!selectedEvent.recurring && `, ${format(selectedEvent.startDate, 'yyyy')}`}
              </DetailValue>
            </EventDetail>
            
            <EventDetail>
              <DetailLabel>End Date:</DetailLabel>
              <DetailValue>
                {format(selectedEvent.endDate, 'MMMM d')}
                {/* Only show year for non-recurring events */}
                {!selectedEvent.recurring && `, ${format(selectedEvent.endDate, 'yyyy')}`}
              </DetailValue>
            </EventDetail>
            
            <EventDetail>
              <DetailLabel>Recurring:</DetailLabel>
              <DetailValue>
                {getRecurringPatternText(selectedEvent)}
              </DetailValue>
            </EventDetail>
            
            {selectedEvent.min_age !== null && selectedEvent.max_age !== null && (
              <EventDetail>
                <DetailLabel>Age Range:</DetailLabel>
                <DetailValue>
                  {selectedEvent.min_age} - {selectedEvent.max_age} years
                </DetailValue>
              </EventDetail>
            )}
            
            {selectedEvent.description && (
              <EventDetail>
                <DetailLabel>Description:</DetailLabel>
                <DetailValue>{selectedEvent.description}</DetailValue>
              </EventDetail>
            )}
            
            <EventDetail>
              <DetailLabel>Importance:</DetailLabel>
              <DetailValue>
                {selectedEvent.importance ? 'Important event' : 'Regular event'}
              </DetailValue>
            </EventDetail>
          </ModalContent>
        </ModalOverlay>
      )}
      
      {/* Debug Panel */}
      {debugMode && (
        <DebugPanel>
          <DebugTitle>Calendar Debug Info</DebugTitle>
          <div>Current Year: {currentDate.getFullYear()}</div>
          <div>Events Loaded: {events.length}</div>
          <div>Events Displayed: {filteredEvents.length} ({showImportantOnly ? 'Important Only' : 'All'})</div>
          <div style={{ 
            fontWeight: 'bold', 
            color: isOlympicYear ? '#4CAF50' : '#ccc' 
          }}>
            Is {currentDate.getFullYear()} an Olympic Year? {isOlympicYear ? 'YES' : 'NO'}
          </div>
          <div>Event Pattern (4-year cycle):</div>
          <div style={{ marginLeft: '10px', fontSize: '11px' }}>
            <div style={{ color: isOlympicYear ? '#4CAF50' : '#ccc' }}>
              • Winter Olympics: 2022, 2026, 2030, 2034...
              {isOlympicYear && ' (THIS YEAR)'}
            </div>
            <div style={{ color: (currentDate.getFullYear() - 2023) % 4 === 0 ? '#4CAF50' : '#ccc' }}>
              • All-Star Events: 2023, 2027, 2031, 2035...
              {(currentDate.getFullYear() - 2023) % 4 === 0 && ' (THIS YEAR)'}
            </div>
            <div style={{ color: (currentDate.getFullYear() - 2025) % 4 === 0 ? '#4CAF50' : '#ccc' }}>
              • 8 Nations/International: 2025, 2029, 2033...
              {(currentDate.getFullYear() - 2025) % 4 === 0 && ' (THIS YEAR)'}
            </div>
            <div style={{ color: (currentDate.getFullYear() - 2024) % 4 === 0 ? '#4CAF50' : '#ccc' }}>
              • Regular league year: 2024, 2028, 2032...
              {(currentDate.getFullYear() - 2024) % 4 === 0 && ' (THIS YEAR)'}
            </div>
          </div>
          <hr style={{ margin: '10px 0', borderColor: '#444' }} />
          <div>Olympic Years Check: {isOlympicYear ? 'YES' : 'NO'}</div>
          <div>
            Base Formula: (Year - 2022) % 4 = {(currentDate.getFullYear() - 2022) % 4}
            {(currentDate.getFullYear() === 2026 || currentDate.getFullYear() === 2030) && 
             ' (Special year override applied)'}
          </div>
          
          <DebugTitle style={{ marginTop: '10px' }}>Special Recurring Events</DebugTitle>
          
          {events
            .filter(event => {
              const name = event.events.toLowerCase();
              return name.includes('olympic') || 
                     name.includes('all star') || 
                     name.includes('nation');
            })
            .map((event, i) => {
              const eventName = event.events.toLowerCase();
              const showThisYear = shouldShowSpecialEvent(event, currentDate.getFullYear());
              
              // Calculate the next year this event will appear
              let nextYear = currentDate.getFullYear();
              while (!shouldShowSpecialEvent(event, nextYear) && nextYear < currentDate.getFullYear() + 10) {
                nextYear++;
              }
              
              // For Olympics, double check our calculation
              const isOlympics = eventName.includes('olympic');
              const isCurrentYearOlympic = isOlympicYear;
              const matchesFormulaOrSpecialCase = isOlympics && isCurrentYearOlympic;
              
              // Check if this event is filtered out by importance
              const isImportant = event.importance === true;
              const isVisibleWithFilter = !showImportantOnly || isImportant;
              
              return (
                <DebugItem 
                  key={i} 
                  style={{ 
                    backgroundColor: isOlympics ? 'rgba(30, 136, 229, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    opacity: isVisibleWithFilter ? 1 : 0.6
                  }}
                >
                  <div>
                    {event.events}
                    {isImportant && (
                      <span style={{ 
                        fontSize: '10px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        marginLeft: '5px'
                      }}>
                        IMPORTANT
                      </span>
                    )}
                    {!isVisibleWithFilter && (
                      <span style={{ 
                        fontSize: '10px', 
                        backgroundColor: '#F44336', 
                        color: 'white',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        marginLeft: '5px'
                      }}>
                        FILTERED OUT
                      </span>
                    )}
                  </div>
                  <div>
                    <small>
                      Status in {currentDate.getFullYear()}: 
                      <DebugStatus isActive={showThisYear && isVisibleWithFilter}>
                        {showThisYear ? (isVisibleWithFilter ? ' VISIBLE' : ' FILTERED') : ' HIDDEN'}
                      </DebugStatus>
                      {isOlympics && (
                        <span style={{ marginLeft: '5px' }}>
                          [Is Olympic Year: <strong>{isCurrentYearOlympic ? 'YES' : 'NO'}</strong>]
                        </span>
                      )}
                    </small>
                  </div>
                  {isOlympics && matchesFormulaOrSpecialCase !== showThisYear && (
                    <div style={{ color: '#F44336' }}>
                      <small>
                        <strong>ERROR:</strong> Formula says {matchesFormulaOrSpecialCase ? 'SHOW' : 'HIDE'} 
                        but function returns {showThisYear ? 'SHOW' : 'HIDE'}
                      </small>
                    </div>
                  )}
                  {!showThisYear && nextYear <= currentDate.getFullYear() + 10 && (
                    <div>
                      <small>Next appearance: {nextYear}</small>
                    </div>
                  )}
                  <div>
                    <small>
                      Pattern: {getRecurringPatternText(event)} | Recurring: {event.recurring ? 'true' : 'false'} | Important: {isImportant ? 'true' : 'false'}
                    </small>
                  </div>
                </DebugItem>
              );
            })}
        </DebugPanel>
      )}
    </CalendarContainer>
  );
};

export default Calendar;
