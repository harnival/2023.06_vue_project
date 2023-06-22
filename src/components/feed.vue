<template>
    <v-app>
        <div id="feed">
            <v-card v-for="item in 4" loading>
                <v-card-title>{{ item }}</v-card-title>
            </v-card>
        </div>
    </v-app>
</template>

<style>
#feed {
    display: flex;
    width: 100%;
    background-color: palegoldenrod;
    color:black;
}
</style>