"use client"
import { useState, useEffect } from "react";
import GoogleMapEmbed from "../components/displayMap";
import Navbar from "../components/Navbar";

export default function mapPage() {
    return (
        <div>
            <Navbar/>
            <GoogleMapEmbed />
        </div>
    );
};
