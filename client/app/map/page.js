"use client"
import { useState, useEffect } from "react";
import GoogleMapEmbed from "../components/displayMap";

export default function mapPage() {
    return (
        <div>
            <GoogleMapEmbed />
        </div>
    );
};
