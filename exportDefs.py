import re
import glob
import xml.etree.ElementTree as ET
import json

gameLoc = "C:/Games/RimWorld v1.3.3389 rev40"
traitsDefsFiles = glob.glob(gameLoc+"/Data/*/Defs/TraitDefs/*.xml")
traitsResult = [];
for traitsDefs in traitsDefsFiles:
	traitsTree = ET.parse(traitsDefs).getroot()
	for traitDef in traitsTree.iter("TraitDef"):
		defName = traitDef.find("defName").text
		defData = [{"label": defSection.find("label").text, "degree":defSection.find("degree").text if defSection.find("degree") != None else None,"name": defName} for defSection in traitDef.findall("degreeDatas/li")]
		defData = {k: v for d in defData for k, v in d.items()}
		defData = {k: v for k, v in defData.items() if v is not None}
		traitsResult.append(defData)

print("public traits : any = "+str(traitsResult))