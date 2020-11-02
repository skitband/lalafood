<template>
    <div class="row">
        <div class="col-md-8">
            <h4 class="mb-3">Map</h4>
            <div class="card p-2" id="map" ref="map">
            </div>
        </div>
        <div class="col-md-4">
            <h4 class="d-flex justify-content-between align-items-center mb-3">
                <span>Address</span>
            </h4>
            <div class="alert alert-danger alert-dismissible fade show" role="alert" v-if="error">
                <strong>Oopps!</strong> {{ this.error }}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form class="card p-2" ref="userForm" @submit="submitForm">
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <label for="from_address">Pick-up Point</label>
                        <input
                            type="text"
                            placeholder="Enter Pick-up Address"
                            ref="origin"
                            class="form-control"
                            required
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <label for="to_address">Drop-off Point</label>
                        <input
                            type="text"
                            placeholder="Enter Drop-off Address"
                            ref="destination"
                            class="form-control"
                            required
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12 mt-2">
                        <div class="text-center" v-if="this.loading">
                            <div class="spinner-border text-secondary" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <button type="button" class="btn btn-secondary" @click="resetForm()" v-if="!this.loading">Reset</button>
                            </div>
                            <div class="col text-right">
                                <button type="submit" class="btn btn-lala" v-if="!this.loading">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            <div class="result-panel" v-if="this.route.distance">
                <p class="text-lala">Total Distance: {{ this.route.distance }}</p>
                <p class="text-lala">Total Duration: {{ this.route.duration }}</p>
            </div>
        </div>
    </div>
</template>
<script src="https://maps.googleapis.com/maps/api/js?libraries=geometry,places&key=AIzaSyA63tWbsVDsOfpBtJd26di0VMVNapsp6ro"></script>
<script>
import axios from "axios";

export default {
    data() {
        return {
            coordinates:{
                lat: 0,
                lng: 0
            },
            route: {
                origin: {
                    address: "",
                    lat: 0,
                    lng: 0,
                },
                destination: {
                    address: "",
                    lat: 0,
                    lng: 0,
                },
                distance: "",
                duration: "",
            },
            token: "",
            error: "",
            loading: false,
            path: [],
            requestSuccess: false,
        }
    },
    created() {
        this.$getLocation({})
        .then(coordinates => {
            this.coordinates = coordinates;
            this.showLocationOnTheMap(this.coordinates.lat, this.coordinates.lng);
            localStorage.setItem('lat', this.coordinates.lat)
            localStorage.setItem('long', this.coordinates.lng)
        })
        .catch(error => console.log(error));
    },

    mounted() {
        for (let ref in this.$refs) {
            const autocomplete = new google.maps.places.Autocomplete(
                this.$refs[ref],
                {
                    bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(localStorage.getItem('lat'), localStorage.getItem('long'))
                    ),
                }
            );

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                this.route[ref].address = `${place.name}, ${place.vicinity}`;
                this.route[ref].lat = place.geometry.location.lat();
                this.route[ref].lng = place.geometry.location.lng();
            });
        }
    },

    methods: {
        
        showLocationOnTheMap(latitude, longitude) {

            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer();

            const map = new google.maps.Map(this.$refs["map"], {
                zoom: 15,
                center: new google.maps.LatLng(latitude, longitude),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            });

            directionsRenderer.setMap(map);
            if(this.requestSuccess){
                this.calculateAndDisplayRoute(directionsService, directionsRenderer);
            }    
            
        },

        calculateAndDisplayRoute(directionsService, directionsRenderer) {
            const waypts = [];
            const paths = this.path;

            for (var i = 0; i < paths.length; i++) {
                waypts.push({
                    location: new google.maps.LatLng(paths[i][0],paths[i][1]),
                    stopover: false
                });
            }
            directionsService.route(
            {
                origin: this.route.origin.address,
                destination: this.route.destination.address,
                waypoints: waypts,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING,
            },
                (response, status) => {
                    console.log(response);
                    if(status === "OK") {
                        directionsRenderer.setDirections(response);
                    } else {
                        window.alert("Failed to Access Google API" + status);
                    }
                }
            );
        },

        submitForm(e){

            e.preventDefault();
            this.loading = true;
            const req = {
                headers: { 'Content-Type': 'application/json' },
            };
            const data = { origin : "Innocentre, Tat Chee Avenue, Kowloon Tong, Hong Kong", destination: "Hong Kong International Airport, Sky Plaza Road, Chek Lap Kok, Hong Kong" };
            axios.post('https://mock-api.dev.lalamove.com/route', data, { req })
                .then(response => {
                    this.token = response.data.token;

                    axios.get(`https://mock-api.dev.lalamove.com/route/${this.token}`)

                    .then(response => {
                        if(response.status === 200) {
                            if(response.data.status === 'failure'){
                                this.error = response.data.error;
                                this.loading = false;
                                return;
                            }else if(response.data.status === 'in progress'){
                                return this.submitForm(e);
                            }else{
                                this.path = response.data.path
                                this.route.distance = response.data.total_distance
                                this.route.duration = response.data.total_time
                                this.error = "";
                                this.loading = false;
                                this.requestSuccess = true;
                                this.showLocationOnTheMap(this.route.origin.lat, this.route.origin.lng);
                            }
                        }else{
                            this.error = response.data.error;
                        }
                        
                    })
                    .catch(error => {
                        this.error = error.response.data;
                        this.loading = false;
                    });
                })
                .catch(error => {
                    this.error = error.response.data
                    this.loading = false;
                });
        },

        resetForm(){
            this.$refs.userForm.reset();
        }

    },
}
</script>

<style scoped>
#map{
    width: 100%; 
    height: 30em; 
    position: absolute; 
    left:0; 
    top:10;
}
.btn-lala{
    background-color: #f57c00;
    color: #ffffff;
}
.txt-lala{
    color: #f57c00;
}
</style>