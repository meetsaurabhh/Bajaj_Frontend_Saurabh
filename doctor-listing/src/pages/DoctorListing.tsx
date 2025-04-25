import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  TextField,
  Paper,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Box,
  Card,
  CardContent,
  Autocomplete,
  CircularProgress,
  Avatar,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Update the Doctor type to match the API response
interface Doctor {
  id: string;
  name: string;
  name_initials: string;
  photo: string;
  doctor_introduction: string;
  specialities: { name: string }[];
  fees: string;
  experience: string;
  languages: string[];
  clinic?: {
    name: string;
    address_line1: string;
    locality: string;
    city: string;
    location: string;
    logo_url: string;
  };
}

interface FilterState {
  searchQuery: string;
  consultationType: 'Video Consult' | 'In Clinic' | null;
  specialties: string[];
  sortBy: 'fees' | 'experience' | null;
}

const API_URL = 'https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json';

// List of all specialties for testing
const ALL_SPECIALTIES = [
  "Dentist",
  "General Physician",
  "Dermatologist",
  "Paediatrician",
  "Gynaecologist",
  "ENT",
  "Diabetologist",
  "Cardiologist",
  "Physiotherapist",
  "Endocrinologist",
  "Orthopaedic",
  "Ophthalmologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Psychiatrist",
  "Urologist",
  "Dietitian-Nutritionist",
  "Psychologist",
  "Sexologist",
  "Nephrologist",
  "Neurologist",
  "Oncologist",
  "Ayurveda",
  "Homeopath"
];

const DoctorListing = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: searchParams.get('search') || '',
    consultationType: (searchParams.get('consultationType') as 'Video Consult' | 'In Clinic') || null,
    specialties: searchParams.get('specialties')?.split(',').filter(Boolean) || [],
    sortBy: (searchParams.get('sortBy') as 'fees' | 'experience') || null,
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctors.length > 0) {
      applyFilters();
    }
  }, [doctors, filterState]);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch doctors data');
      }
      const data = await response.json();
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...doctors];
    console.log('Initial doctors:', filtered);

    // Apply search filter
    if (filterState.searchQuery) {
      const searchLower = filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.specialities.some(spec => spec.name.toLowerCase().includes(searchLower)) ||
        (doctor.clinic?.name && doctor.clinic.name.toLowerCase().includes(searchLower))
      );
      console.log('After search filter:', filtered);
    }

    // Apply specialties filter
    if (filterState.specialties && filterState.specialties.length > 0) {
      filtered = filtered.filter(doctor =>
        filterState.specialties.some(specialty =>
          doctor.specialities.some(spec => spec.name === specialty)
        )
      );
      console.log('After specialties filter:', filtered);
    }

    // Apply sorting
    if (filterState.sortBy) {
      if (filterState.sortBy === 'fees') {
        filtered.sort((a, b) => {
          const aFees = parseInt(a.fees.replace(/[^0-9]/g, ''));
          const bFees = parseInt(b.fees.replace(/[^0-9]/g, ''));
          return aFees - bFees;
        });
      } else if (filterState.sortBy === 'experience') {
        filtered.sort((a, b) => {
          const aExp = parseInt(a.experience.replace(/[^0-9]/g, ''));
          const bExp = parseInt(b.experience.replace(/[^0-9]/g, ''));
          return bExp - aExp;
        });
      }
      console.log('After sorting:', filtered);
    }

    setFilteredDoctors(filtered);
  };

  const handleSearchChange = (value: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: value }));
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }
      return newParams;
    });
  };

  const handleConsultationTypeChange = (value: string) => {
    console.log('Consultation type selected:', value);
    const consultationType = value === '' ? null : value as 'Video Consult' | 'In Clinic';
    setFilterState(prev => {
      const newState = { ...prev, consultationType };
      console.log('New filter state:', newState);
      return newState;
    });
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (consultationType) {
        newParams.set('consultationType', consultationType);
      } else {
        newParams.delete('consultationType');
      }
      return newParams;
    });
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFilterState(prev => {
      const newSpecialties = checked
        ? [...prev.specialties, specialty]
        : prev.specialties.filter(s => s !== specialty);
      return { ...prev, specialties: newSpecialties };
    });
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      const currentSpecialties = prev.get('specialties')?.split(',').filter(Boolean) || [];
      const newSpecialties = checked
        ? [...currentSpecialties, specialty]
        : currentSpecialties.filter(s => s !== specialty);
      
      if (newSpecialties.length > 0) {
        newParams.set('specialties', newSpecialties.join(','));
      } else {
        newParams.delete('specialties');
      }
      return newParams;
    });
  };

  const handleSortChange = (value: string) => {
    const sortBy = value === '' ? null : value as 'fees' | 'experience';
    setFilterState(prev => ({ ...prev, sortBy }));
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (sortBy) {
        newParams.set('sortBy', sortBy);
      } else {
        newParams.delete('sortBy');
      }
      return newParams;
    });
  };

  const getUniqueSpecialties = () => {
    if (!doctors || doctors.length === 0) return [];
    const specialties = new Set<string>();
    doctors.forEach(doctor => {
      if (doctor.specialities && Array.isArray(doctor.specialities)) {
        doctor.specialities.forEach(specialty => specialties.add(specialty.name));
      }
    });
    return Array.from(specialties).sort();
  };

  const renderSpecialties = () => {
    return (
      <>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }} data-testid="filter-header-speciality">
          Speciality
        </Typography>
        {ALL_SPECIALTIES.map((specialty) => (
          <FormControlLabel
            key={specialty}
            control={
              <Checkbox
                checked={filterState.specialties.includes(specialty)}
                onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                data-testid={`filter-specialty-${specialty.replace(/\s+/g, '-').replace('/', '-')}`}
              />
            }
            label={specialty}
          />
        ))}
      </>
    );
  };

  const renderSearchBar = () => (
    <Box 
      sx={{ 
        backgroundColor: '#2962A4',
        py: 2,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Container maxWidth="lg">
        <TextField
          fullWidth
          placeholder="Search Symptoms, Doctors, Specialists, Clinics"
          variant="outlined"
          value={filterState.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Container>
    </Box>
  );

  const renderDoctorCard = (doctor: Doctor) => {
    if (!doctor) return null;
    
    const experienceYears = parseInt(doctor.experience.replace(/[^0-9]/g, ''));
    
    return (
      <Card sx={{ mb: 2, boxShadow: 1 }} data-testid="doctor-card">
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item>
              <Avatar
                sx={{ width: 80, height: 80 }}
                src={doctor.photo}
                alt={doctor.name}
              />
            </Grid>
            <Grid item xs>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" gutterBottom data-testid="doctor-name">
                    {doctor.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom data-testid="doctor-experience">
                    Experience: {experienceYears} years
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom data-testid="doctor-specialty">
                    {doctor.specialities.map(spec => spec.name).join(', ')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocalHospitalIcon sx={{ fontSize: 'small', mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {doctor.clinic?.name || 'General Clinic'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 'small', mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="textSecondary">
                      {doctor.clinic ? (
                        `${doctor.clinic.address_line1}, ${doctor.clinic.locality}, ${doctor.clinic.city}`
                      ) : (
                        'Location not specified'
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" color="primary" gutterBottom data-testid="doctor-fee">
                    {doctor.fees}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1 }}
                    onClick={() => {/* Add booking logic */}}
                  >
                    Book Appointment
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Box>
        {renderSearchBar()}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        {renderSearchBar()}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <Typography color="error">{error}</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      {renderSearchBar()}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Filters</Typography>
                <Button 
                  color="primary" 
                  onClick={() => {
                    setFilterState({
                      searchQuery: '',
                      consultationType: null,
                      specialties: [],
                      sortBy: null,
                    });
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear All
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom data-testid="filter-header-sort">
                  Sort by
                </Typography>
                <RadioGroup
                  value={filterState.sortBy || ''}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <FormControlLabel
                    value="fees"
                    control={<Radio data-testid="sort-fees" />}
                    label="Price: Low-High"
                  />
                  <FormControlLabel
                    value="experience"
                    control={<Radio data-testid="sort-experience" />}
                    label="Experience: Most Experience first"
                  />
                  <FormControlLabel
                    value=""
                    control={<Radio />}
                    label="None"
                  />
                </RadioGroup>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom data-testid="filter-header-moc">
                  Mode of consultation
                </Typography>
                <RadioGroup
                  value={filterState.consultationType || ''}
                  onChange={(e) => handleConsultationTypeChange(e.target.value)}
                >
                  <FormControlLabel
                    value="Video Consult"
                    control={<Radio data-testid="filter-video-consult" />}
                    label="Video Consultation"
                  />
                  <FormControlLabel
                    value="In Clinic"
                    control={<Radio data-testid="filter-in-clinic" />}
                    label="In-clinic Consultation"
                  />
                  <FormControlLabel
                    value=""
                    control={<Radio />}
                    label="All"
                  />
                </RadioGroup>
              </Box>

              {renderSpecialties()}
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Autocomplete
              freeSolo
              options={Array.from(new Set(doctors.map(doctor => doctor.name)))}
              value={filterState.searchQuery}
              onChange={(_, value) => handleSearchChange(value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  data-testid="autocomplete-input"
                  label="Search Doctors"
                  fullWidth
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option} data-testid="suggestion-item">
                  {option}
                </li>
              )}
              ListboxProps={{
                style: { maxHeight: '200px' }
              }}
              componentsProps={{
                popper: {
                  style: { width: 'fit-content' }
                }
              }}
              sx={{ mb: 3 }}
            />
            {filteredDoctors && filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <Box key={doctor.id}>
                  {renderDoctorCard(doctor)}
                </Box>
              ))
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="textSecondary">No doctors found matching your criteria</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DoctorListing; 